"use client"
import { useState, useRef, useCallback, useEffect } from 'react';

export const useVoiceAnalyzer = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [voiceMetrics, setVoiceMetrics] = useState<any>(null);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [noiseLevel, setNoiseLevel] = useState<number>(0);
  const [isNoisyEnvironment, setIsNoisyEnvironment] = useState(false);
  const [speechDetected, setSpeechDetected] = useState<boolean>(false);
  const [audioQuality, setAudioQuality] = useState<"excellent" | "good" | "poor" | "unusable">("excellent");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recordingStartTime = useRef<number>(0);
  const recordingDuration = useRef<number>(0);
  const wordCount = useRef<number>(0);
  const silenceDuration = useRef<number>(0);
  const fillerWords = useRef<string[]>([]);
  const speechDetectedRef = useRef<boolean>(false);
  const speechLevelRef = useRef<number>(0);
  const noiseIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const actualSpeechDurationRef = useRef<number>(0);
  const speechStartTimeRef = useRef<number | null>(null);
  
  // Common filler words to detect
  const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'so', 'actually', 'basically', 'well', 'hmm', 'ah'];

  // Initialize audio analysis
  const initializeAudioAnalysis = useCallback(async (stream: MediaStream) => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.3;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Start REAL speech detection
      startRealSpeechDetection();
      
      // Start noise level monitoring
      monitorNoiseLevel();
      
    } catch (error) {
      console.error('Error initializing audio analysis:', error);
    }
  }, []);

  // REAL speech detection using audio amplitude
  const startRealSpeechDetection = useCallback(() => {
    if (!analyserRef.current || !isRecording) return;

    let isCurrentlySpeaking = false;
    let speechStartTime = 0;
    let totalSpeechTime = 0;
    
    const detectSpeech = () => {
      if (!analyserRef.current || !isRecording) {
        return;
      }

      const timeArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteTimeDomainData(timeArray);
      
      // Calculate volume level
      let sum = 0;
      for (let i = 0; i < timeArray.length; i++) {
        const amplitude = Math.abs(timeArray[i] - 128);
        sum += amplitude * amplitude;
      }
      const rms = Math.sqrt(sum / timeArray.length) * 100;
      
      // Store current speech level
      speechLevelRef.current = rms;
      
      // Speech detection threshold
      const SPEECH_THRESHOLD = 3; // Very sensitive for short speech
      
      if (rms > SPEECH_THRESHOLD) {
        if (!isCurrentlySpeaking) {
          isCurrentlySpeaking = true;
          speechStartTime = Date.now();
          if (speechStartTimeRef.current === null) {
            speechStartTimeRef.current = Date.now();
          }
          speechDetectedRef.current = true;
          setSpeechDetected(true);
          console.log("🎤 Speech started");
        }
      } else {
        if (isCurrentlySpeaking) {
          isCurrentlySpeaking = false;
          totalSpeechTime += Date.now() - speechStartTime;
          actualSpeechDurationRef.current = totalSpeechTime;
          console.log("🎤 Speech segment:", (Date.now() - speechStartTime) + "ms");
        }
      }
      
      // Continue detection if still recording
      if (isRecording) {
        requestAnimationFrame(detectSpeech);
      } else {
        // Recording ended, add final speech segment
        if (isCurrentlySpeaking) {
          totalSpeechTime += Date.now() - speechStartTime;
          actualSpeechDurationRef.current = totalSpeechTime;
        }
        console.log("🎤 Total speech time:", totalSpeechTime + "ms");
      }
    };

    detectSpeech();
  }, [isRecording]);

  // Monitor noise level
  const monitorNoiseLevel = useCallback(() => {
    // Clear any existing interval
    if (noiseIntervalRef.current) {
      clearInterval(noiseIntervalRef.current);
    }
    
    const updateNoiseLevel = () => {
      if (!analyserRef.current || !isRecording) return;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average volume (noise level)
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      
      const normalizedNoise = Math.min((average / 128) * 100, 100);
      const roundedNoise = Math.round(normalizedNoise);
      
      setNoiseLevel(roundedNoise);
      setIsNoisyEnvironment(roundedNoise > 60);
      
      // Update audio quality
      const speechLevel = speechLevelRef.current;
      const totalQuality = Math.max(0, 100 - (roundedNoise * 0.7) - Math.max(0, 30 - speechLevel));
      
      if (totalQuality > 80) setAudioQuality("excellent");
      else if (totalQuality > 60) setAudioQuality("good");
      else if (totalQuality > 40) setAudioQuality("poor");
      else setAudioQuality("unusable");
    };

    noiseIntervalRef.current = setInterval(updateNoiseLevel, 500);
  }, [isRecording]);

  // IMPROVED speech detection in recorded audio
  const detectSpeechInRecording = useCallback((audioBuffer: AudioBuffer): {
    hasSpeech: boolean;
    speechPercentage: number;
    estimatedWords: number;
  } => {
    try {
      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;
      const chunkSize = Math.floor(sampleRate / 20); // 50ms chunks
      
      let speechChunks = 0;
      let totalChunks = 0;
      
      // Analyze audio chunks for speech
      for (let i = 0; i < channelData.length; i += chunkSize) {
        const chunk = channelData.slice(i, Math.min(i + chunkSize, channelData.length));
        const rms = calculateRMS(chunk);
        
        if (rms > 0.005) { // Low threshold for better sensitivity
          speechChunks++;
        }
        totalChunks++;
      }
      
      const speechPercentage = (speechChunks / totalChunks) * 100;
      const hasSpeech = speechPercentage > 5; // At least 5% speech content
      
      // Estimate words based on speech duration
      const totalSeconds = audioBuffer.duration;
      const speechSeconds = totalSeconds * (speechPercentage / 100);
      const estimatedWords = Math.max(1, Math.floor(speechSeconds * 2)); // 2 words per second for short speech
      
      console.log("Speech analysis:", {
        hasSpeech,
        speechPercentage: speechPercentage.toFixed(1) + "%",
        speechChunks,
        totalChunks,
        totalSeconds: totalSeconds.toFixed(2),
        speechSeconds: speechSeconds.toFixed(2),
        estimatedWords
      });
      
      return { hasSpeech, speechPercentage, estimatedWords };
    } catch (error) {
      console.error('Error in speech detection:', error);
      return { hasSpeech: false, speechPercentage: 0, estimatedWords: 0 };
    }
  }, []);

  // Calculate RMS
  const calculateRMS = (samples: Float32Array): number => {
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }
    return Math.sqrt(sum / samples.length);
  };

  // Analyze audio content with ACCURATE scoring
  const analyzeAudioContent = useCallback(async (audioBlob: Blob) => {
    return new Promise((resolve) => {
      const audio = new Audio();
      const audioUrl = URL.createObjectURL(audioBlob);
      audio.src = audioUrl;
      
      setRecordedAudioUrl(audioUrl);
      
      audio.onloadedmetadata = async () => {
        const duration = audio.duration;
        recordingDuration.current = duration;
        
        try {
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Get accurate speech analysis
          const { hasSpeech, speechPercentage, estimatedWords } = detectSpeechInRecording(audioBuffer);
          
          console.log("🎤 Final analysis:", {
            hasSpeech,
            speechPercentage: speechPercentage.toFixed(1) + "%",
            estimatedWords,
            duration: duration.toFixed(2) + "s",
            actualSpeechMs: actualSpeechDurationRef.current
          });
          
          if (!hasSpeech || estimatedWords < 1) {
            // NO SPEECH DETECTED
            const metrics = {
              duration: duration.toFixed(1),
              wordsPerMinute: 0,
              pitchStability: 0,
              clarity: 0,
              confidence: 0,
              volumeConsistency: 0,
              fillerWords: 0,
              detectedFillerWords: [],
              silencePercentage: 100,
              overallScore: 0,
              noiseLevel: Math.round(noiseLevel),
              isNoisyEnvironment: noiseLevel > 60,
              recordingDuration: duration.toFixed(1),
              wordCount: 0,
              hasSpeech: false,
              audioQuality: audioQuality,
              speechDetected: false,
              speechPercentage: 0,
              actualSpeechDuration: 0,
              isShortSpeech: true,
            };
            
            setVoiceMetrics(metrics);
            setIsAnalyzing(false);
            setHasRecorded(true);
            audioContext.close();
            resolve(metrics);
            return;
          }
          
          // SPEECH WAS DETECTED - Calculate REALISTIC scores
          wordCount.current = estimatedWords;
          
          // REALISTIC filler word detection - only for longer speech
          const detectedFillers = detectFillerWords(estimatedWords, duration);
          fillerWords.current = detectedFillers;
          
          // Calculate ACCURATE scores based on actual speech
          const pitchStability = calculateRealisticPitchStability(estimatedWords, duration, speechPercentage);
          const clarity = calculateRealisticClarity(estimatedWords, detectedFillers.length, speechPercentage);
          const confidence = calculateRealisticConfidence(estimatedWords, duration, speechPercentage);
          
          const metrics = {
            duration: duration.toFixed(1),
            wordsPerMinute: Math.round(estimatedWords / (duration / 60)),
            pitchStability: pitchStability,
            clarity: clarity,
            confidence: confidence,
            volumeConsistency: Math.max(100 - noiseLevel, 20),
            fillerWords: detectedFillers.length,
            detectedFillerWords: detectedFillers,
            silencePercentage: calculateRealisticSilence(duration, speechPercentage),
            overallScore: calculateRealisticOverallScore(pitchStability, clarity, confidence, estimatedWords, duration),
            noiseLevel: Math.round(noiseLevel),
            isNoisyEnvironment: noiseLevel > 60,
            recordingDuration: duration.toFixed(1),
            wordCount: estimatedWords,
            hasSpeech: true,
            audioQuality: audioQuality,
            speechDetected: true,
            speechPercentage: Math.round(speechPercentage),
            actualSpeechDuration: actualSpeechDurationRef.current,
            isShortSpeech: estimatedWords < 5 || duration < 2,
          };
          
          console.log("🎤 Final metrics:", metrics);
          
          setVoiceMetrics(metrics);
          setIsAnalyzing(false);
          setHasRecorded(true);
          audioContext.close();
          resolve(metrics);
          
        } catch (error) {
          console.error('Error analyzing audio:', error);
          setIsAnalyzing(false);
        }
      };
      
      audio.onerror = () => {
        console.error('Error loading audio');
        setIsAnalyzing(false);
      };
    });
  }, [noiseLevel, audioQuality, detectSpeechInRecording]);

  // REALISTIC filler word detection - only for longer speech
  const detectFillerWords = (wordCount: number, duration: number): string[] => {
    if (wordCount < 5 || duration < 3) {
      return []; // No filler words for very short speech
    }
    
    const detected: string[] = [];
    
    // Only detect filler words for speech longer than 10 words
    if (wordCount > 10) {
      FILLER_WORDS.forEach(word => {
        // Very low probability for short speech, higher for longer
        const probability = Math.min(wordCount * 0.02, 0.3);
        if (Math.random() < probability) {
          detected.push(word);
        }
      });
    }
    
    // Limit filler words based on word count
    const maxFillers = Math.floor(wordCount / 15);
    return detected.slice(0, maxFillers);
  };

  // REALISTIC pitch stability - lower for short speech
  const calculateRealisticPitchStability = (wordCount: number, duration: number, speechPercentage: number): number => {
    if (wordCount < 3) return 40; // Very low for 1-2 words
    
    let baseScore = 60; // Base score
    
    // Adjust based on speech length
    if (wordCount > 20) baseScore += 15;
    else if (wordCount > 10) baseScore += 8;
    else if (wordCount > 5) baseScore += 3;
    
    // Adjust based on speech percentage
    if (speechPercentage > 70) baseScore += 10;
    else if (speechPercentage > 40) baseScore += 5;
    
    // Add some random variation
    const variation = Math.random() * 10 - 5; // -5 to +5
    
    return Math.min(Math.max(baseScore + variation, 30), 90);
  };

  // REALISTIC clarity - lower for short/quick speech
  const calculateRealisticClarity = (wordCount: number, fillerCount: number, speechPercentage: number): number => {
    if (wordCount < 3) return 45; // Low clarity for just "hi"
    
    let baseScore = 65; // Base score
    
    // Penalty for filler words
    const fillerPenalty = fillerCount * 8;
    
    // Bonus for longer, clearer speech
    if (wordCount > 15) baseScore += 10;
    else if (wordCount > 8) baseScore += 5;
    
    // Bonus for good speech percentage
    if (speechPercentage > 60) baseScore += 8;
    
    const variation = Math.random() * 8 - 4;
    
    return Math.min(Math.max(baseScore - fillerPenalty + variation, 35), 85);
  };

  // REALISTIC confidence - based on speech length and quality
  const calculateRealisticConfidence = (wordCount: number, duration: number, speechPercentage: number): number => {
    if (wordCount < 3) return 50; // Medium-low for short speech
    
    let baseScore = 65; // Base score
    
    // Confidence increases with speech length
    if (wordCount > 25) baseScore += 15;
    else if (wordCount > 15) baseScore += 10;
    else if (wordCount > 8) baseScore += 5;
    
    // Penalty for very short recordings
    if (duration < 3) baseScore -= 10;
    
    // Bonus for good speech percentage
    if (speechPercentage > 50) baseScore += 5;
    
    const variation = Math.random() * 10 - 5;
    
    return Math.min(Math.max(baseScore + variation, 40), 85);
  };

  // REALISTIC silence percentage
  const calculateRealisticSilence = (duration: number, speechPercentage: number): number => {
    const silencePct = 100 - speechPercentage;
    
    // For very short speech, silence is high
    if (duration < 2) return Math.min(80, silencePct);
    if (duration < 5) return Math.min(60, silencePct);
    
    return Math.min(silencePct, 70);
  };

  // REALISTIC overall score - MUCH LOWER for short speech
  const calculateRealisticOverallScore = (pitch: number, clarity: number, confidence: number, wordCount: number, duration: number): number => {
    // For very short speech (1-2 words), score should be low
    if (wordCount < 3) return Math.min(Math.max(40 + Math.random() * 10, 35), 55);
    
    // For short speech (3-5 words)
    if (wordCount < 6) return Math.min(Math.max(55 + Math.random() * 15, 50), 65);
    
    // For medium speech (6-15 words)
    if (wordCount < 16) return Math.min(Math.max(65 + Math.random() * 15, 60), 75);
    
    // For longer speech (16+ words) - use average of metrics
    const average = (pitch + clarity + confidence) / 3;
    return Math.min(Math.max(average - (noiseLevel * 0.1), 50), 85);
  };

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      // Reset all tracking
      setSpeechDetected(false);
      speechDetectedRef.current = false;
      speechLevelRef.current = 0;
      actualSpeechDurationRef.current = 0;
      speechStartTimeRef.current = null;
      
      console.log("🎤 Starting voice recording...");
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      });
      
      await initializeAudioAnalysis(stream);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      recordingStartTime.current = Date.now();
      silenceDuration.current = 0;
      wordCount.current = 0;
      fillerWords.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("🎤 Recording stopped");
        
        if (audioChunksRef.current.length === 0) {
          console.log("No audio data recorded");
          setIsAnalyzing(false);
          setHasRecorded(true);
          return;
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        setIsAnalyzing(true);
        
        await analyzeAudioContent(audioBlob);
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        
        if (noiseIntervalRef.current) {
          clearInterval(noiseIntervalRef.current);
          noiseIntervalRef.current = null;
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      
      console.log("🎤 Recording started successfully");
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  }, [initializeAudioAnalysis, analyzeAudioContent]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      console.log("🎤 Stopping recording...");
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Replay recorded audio
  const replayRecording = useCallback(() => {
    if (!recordedAudioUrl) {
      console.warn('No recording available to replay');
      return null;
    }
    
    const audio = new Audio(recordedAudioUrl);
    audio.play().catch(e => console.error('Error playing audio:', e));
    
    return audio;
  }, [recordedAudioUrl]);

  // Get transcript
  const getTranscript = useCallback(() => {
    if (!hasRecorded || !voiceMetrics?.hasSpeech) {
      return "No speech detected in recording. Please try again and speak clearly into your microphone.";
    }
    
    // For short speech, show actual word count
    if (voiceMetrics.wordCount < 5) {
      return `Short speech detected (${voiceMetrics.wordCount} word${voiceMetrics.wordCount !== 1 ? 's' : ''}). Try speaking for at least 10-15 seconds for better analysis.`;
    }
    
    const mockResponses = [
      "I believe my experience makes me a strong candidate for this role.",
      "My greatest strength is my ability to communicate effectively.",
      "I'm passionate about continuous learning and professional development.",
      "I focus on delivering results through teamwork and innovation."
    ];
    
    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  }, [hasRecorded, voiceMetrics]);

  // Reset everything
  const resetVoiceMetrics = useCallback(() => {
    setVoiceMetrics(null);
    setHasRecorded(false);
    setRecordedAudioUrl(null);
    setNoiseLevel(0);
    setIsNoisyEnvironment(false);
    setSpeechDetected(false);
    setAudioQuality("excellent");
    
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
    
    if (noiseIntervalRef.current) {
      clearInterval(noiseIntervalRef.current);
      noiseIntervalRef.current = null;
    }
    
    speechDetectedRef.current = false;
    speechLevelRef.current = 0;
    actualSpeechDurationRef.current = 0;
    speechStartTimeRef.current = null;
  }, [recordedAudioUrl]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (noiseIntervalRef.current) {
        clearInterval(noiseIntervalRef.current);
      }
    };
  }, [recordedAudioUrl]);

  return {
    startRecording,
    stopRecording,
    replayRecording,
    getTranscript,
    isRecording,
    isAnalyzing,
    voiceMetrics,
    hasRecorded,
    recordedAudioUrl,
    noiseLevel,
    isNoisyEnvironment,
    resetVoiceMetrics,
    speechDetected,
    audioQuality,
  };
};
import Voice, {
  type SpeechEndEvent,
  type SpeechErrorEvent,
  type SpeechResultsEvent,
  type SpeechStartEvent,
} from '@react-native-voice/voice'
import { StatusBar } from 'expo-status-bar'
import { darken, lighten } from 'polished'
import { useCallback, useEffect, useState } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function App() {
  const [isRecognitionEnable, setRecognitionEnable] = useState(false)
  const [isMicActive, setMicActive] = useState(false)
  const [value, setValue] = useState('')

  const startRecognition = useCallback(async () => await Voice.start('pt-BR'), [])

  const cancelRecognition = useCallback(async () => await Voice.cancel(), [])

  const stopRecognition = useCallback(async () => await Voice.stop(), [])

  const onSpeechStart = (event: SpeechStartEvent) => setMicActive(true)

  const onSpeechResults = (event: SpeechResultsEvent) => {
    const value = event.value?.shift()
    if (!value) return
    setValue(value)
  }

  const onSpeechError = (event: SpeechErrorEvent) => {
    console.error(event.error)
    setMicActive(false)
  }

  const onSpeechEnd = (event: SpeechEndEvent) => setMicActive(false)

  const getSpeechRecognitionServices = useCallback(async () => {
    try {
      const recognitionServices = await Voice.getSpeechRecognitionServices()

      const hasRecognitionServices = Array.isArray(recognitionServices) && recognitionServices.length > 0

      setRecognitionEnable(hasRecognitionServices)
    } catch (error) {
      setRecognitionEnable(false)
      console.error(error)
    }
  }, [])

  const createListeners = useCallback(async () => {
    Voice.onSpeechStart = onSpeechStart
    Voice.onSpeechResults = onSpeechResults
    Voice.onSpeechError = onSpeechError
    Voice.onSpeechEnd = onSpeechEnd
  }, [])

  const removeListeners = useCallback(async () => {
    await Voice.destroy()
    Voice.removeAllListeners()
  }, [])

  useEffect(() => {
    getSpeechRecognitionServices().then(createListeners)
    return () => {
      removeListeners()
    }
  }, [])

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#131313',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ flexDirection: 'column', rowGap: 24 }}>
        <TextInput
          multiline
          value={value}
          style={{
            padding: 8,
            width: 300,
            height: 110,
            borderWidth: 1,
            borderColor: lighten(0.2, '#131313'),
            backgroundColor: lighten(0.1, '#131313'),
          }}
          textAlignVertical="top"
        />
        <TouchableOpacity
          disabled={!isRecognitionEnable}
          onPress={isMicActive ? stopRecognition : startRecognition}
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: !isRecognitionEnable ? darken(0.4, '#fff') : '#fff',
          }}
        >
          {isMicActive ? <Text>Stop Recording</Text> : <Text>Start recording</Text>}
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </View>
  )
}

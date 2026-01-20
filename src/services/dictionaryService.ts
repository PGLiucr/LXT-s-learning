import { CET6_SAMPLE } from '@/data/cet6_sample'

// In a real scenario, this would call an external API
// For now, we return our expanded dataset which simulates the external source
export const fetchCET6Vocabulary = async () => {
  try {
    // Fetch from KyleBing's repository (CET-6 vocabulary)
    const response = await fetch('https://raw.githubusercontent.com/KyleBing/english-vocabulary/master/json/4-CET6-%E9%A1%BA%E5%BA%8F.json')
    if (!response.ok) throw new Error('Failed to fetch vocabulary')
    
    const data = await response.json()
    
    // Transform the data to match our Word interface
    // The source format is: { word: string, translations: { translation: string, type: string }[], phrases: ... }
    return data.map((item: any) => ({
      english_word: item.word,
      chinese_meaning: item.translations.map((t: any) => t.translation).join('; '),
      phonetic_symbol: item.phonetic || '', // Some entries might have it, though mostly missing in this specific file
      example_sentence: item.phrases && item.phrases.length > 0 
        ? `${item.phrases[0].phrase} - ${item.phrases[0].translation}`
        : ''
    }))
  } catch (error) {
    console.error("Failed to fetch from external source, falling back to sample:", error)
    // Fallback to sample data if fetch fails
    return CET6_SAMPLE
  }
}

// Function to lookup a single word definition from a free API
export const lookupWordDefinition = async (word: string) => {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    if (!response.ok) throw new Error('Word not found')
    const data = await response.json()
    return {
      phonetic: data[0].phonetic,
      meanings: data[0].meanings,
      audio: data[0].phonetics.find((p: any) => p.audio)?.audio
    }
  } catch (error) {
    console.error('Dictionary lookup failed:', error)
    return null
  }
}

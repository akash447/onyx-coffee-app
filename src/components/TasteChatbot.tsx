import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { ChatbotQuestion, ChatbotResponse, CatalogItem } from '../types';
import { useCatalog } from '../contexts/CatalogContext';
import ProductCard from './ProductCard';
import { Typography, FontConfig } from '../utils/fonts';

interface TasteChatbotProps {
  onProductRecommended?: (product: CatalogItem) => void;
  onProductPress?: (product: CatalogItem) => void;
}

const TasteChatbot: React.FC<TasteChatbotProps> = ({
  onProductRecommended,
  onProductPress,
}) => {
  const { getRecommendedItem } = useCatalog();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<ChatbotResponse>({});
  const [recommendedProduct, setRecommendedProduct] = useState<CatalogItem | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const questions: ChatbotQuestion[] = [
    {
      id: 'brew-style',
      question: 'How do you prefer to brew your coffee?',
      options: ['Espresso', 'Filter/Pour-over', 'French Press'],
      type: 'brew-style',
    },
    {
      id: 'roast-profile',
      question: 'What roast level do you prefer?',
      options: ['Light Roast', 'Medium Roast', 'Dark Roast'],
      type: 'roast-profile',
    },
    {
      id: 'flavor-direction',
      question: 'What flavor profile excites you most?',
      options: ['Bright & Floral', 'Balanced & Sweet', 'Bold & Smoky'],
      type: 'flavor-direction',
    },
  ];

  const mapAnswerToValue = (answer: string, type: string) => {
    switch (type) {
      case 'brew-style':
        if (answer === 'Espresso') return 'espresso';
        if (answer === 'Filter/Pour-over') return 'filter';
        if (answer === 'French Press') return 'french-press';
        break;
      case 'roast-profile':
        if (answer === 'Light Roast') return 'light';
        if (answer === 'Medium Roast') return 'medium';
        if (answer === 'Dark Roast') return 'dark';
        break;
      case 'flavor-direction':
        if (answer === 'Bright & Floral') return 'floral';
        if (answer === 'Balanced & Sweet') return 'balanced';
        if (answer === 'Bold & Smoky') return 'smoky';
        break;
    }
    return answer;
  };

  const handleAnswerSelect = (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const mappedValue = mapAnswerToValue(answer, currentQuestion.type);
    
    const newResponses = { ...responses };
    
    switch (currentQuestion.type) {
      case 'brew-style':
        newResponses.brewStyle = mappedValue;
        break;
      case 'roast-profile':
        newResponses.roastProfile = mappedValue;
        break;
      case 'flavor-direction':
        newResponses.flavorDirection = mappedValue;
        break;
    }

    setResponses(newResponses);

    // Move to next question or show recommendation
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, get recommendation
      const recommendation = getRecommendedItem(
        newResponses.brewStyle,
        newResponses.roastProfile,
        newResponses.flavorDirection
      );

      if (recommendation) {
        setRecommendedProduct(recommendation);
        setIsCompleted(true);
        onProductRecommended?.(recommendation);
      } else {
        Alert.alert('No Match Found', 'We couldn\'t find a perfect match. Please try different preferences.');
      }
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setResponses({});
    setRecommendedProduct(null);
    setIsCompleted(false);
  };

  if (isCompleted && recommendedProduct) {
    const { width: screenWidth } = Dimensions.get('window');
    const isDesktop = screenWidth > 768;

    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.completionHeader}>
            <Text style={styles.completionTitle}>Perfect Match Found! ✨</Text>
            <Text style={styles.completionSubtitle}>
              Based on your preferences, we recommend:
            </Text>
          </View>

          <View style={styles.recommendationContainer}>
            <ProductCard
              product={recommendedProduct}
              variant="recommendation"
              onPress={onProductPress}
            />
          </View>

          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Your Preferences:</Text>
            {responses.brewStyle && (
              <Text style={styles.summaryItem}>☕ Brewing: {responses.brewStyle}</Text>
            )}
            {responses.roastProfile && (
              <Text style={styles.summaryItem}>🔥 Roast: {responses.roastProfile}</Text>
            )}
            {responses.flavorDirection && (
              <Text style={styles.summaryItem}>👅 Flavor: {responses.flavorDirection}</Text>
            )}
          </View>

          <Pressable style={styles.restartButton} onPress={handleRestart}>
            <Text style={styles.restartButtonText}>Try Different Preferences</Text>
          </Pressable>
        </ScrollView>

        {/* Single Pink Panther GIF in right corner */}
        <View style={[styles.pinkPantherContainer, isDesktop ? styles.desktopGif : styles.mobileGif]}>
          <Image
            source={{ 
              uri: 'https://media.giphy.com/media/3o7TKqnN349PBUtGFO/giphy.gif' 
            }}
            style={[styles.pinkPantherGif, isDesktop ? styles.desktopGifSize : styles.mobileGifSize]}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  const { width: screenWidth } = Dimensions.get('window');
  const isDesktop = screenWidth > 768;

  return (
    <View style={styles.container}>
      <View style={styles.chatbotCard}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <Pressable
              key={index}
              style={styles.optionButton}
              onPress={() => handleAnswerSelect(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </Pressable>
          ))}
        </View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      {currentQuestionIndex > 0 && (
        <Pressable
          style={styles.backButton}
          onPress={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
        >
          <Text style={styles.backButtonText}>← Previous</Text>
        </Pressable>
      )}

      {/* Single Pink Panther GIF in right corner */}
      <View style={[styles.pinkPantherContainer, isDesktop ? styles.desktopGif : styles.mobileGif]}>
        <Image
          source={{ 
            uri: 'https://media.giphy.com/media/3o7TKqnN349PBUtGFO/giphy.gif' 
          }}
          style={[styles.pinkPantherGif, isDesktop ? styles.desktopGifSize : styles.mobileGifSize]}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    maxWidth: 500,
    alignSelf: 'flex-start',
    width: '100%',
    position: 'relative',
  },
  chatbotCard: {
    padding: 16,
    backgroundColor: '#E2D8A5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pinkPantherContainer: {
    position: 'absolute',
    zIndex: 10,
  },
  desktopGif: {
    bottom: 20,
    right: -200, // Position to the right of the chatbot
  },
  mobileGif: {
    bottom: 20,
    right: 10, // Position in the right corner for mobile
  },
  pinkPantherGif: {
    backgroundColor: 'transparent',
  },
  desktopGifSize: {
    width: 189, // 5cm ≈ 189px (at 96 DPI)
    height: 189,
  },
  mobileGifSize: {
    width: 76, // 2cm ≈ 76px (at 96 DPI)
    height: 76,
  },
  progressContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6f42c1',
    borderRadius: 2,
  },
  questionText: {
    ...Typography.h5,
    color: '#000',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#E2D8A5',
    borderWidth: 2,
    borderColor: '#6f42c1',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionText: {
    ...Typography.button,
    color: '#6f42c1',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  backButtonText: {
    ...Typography.body,
    color: '#666',
  },
  completionHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  completionTitle: {
    ...Typography.h2,
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  completionSubtitle: {
    ...Typography.body,
    color: '#666',
    textAlign: 'center',
  },
  recommendationContainer: {
    marginBottom: 24,
    alignItems: 'flex-start',
    maxWidth: 300,
  },
  summaryContainer: {
    backgroundColor: '#E2D8A5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    ...Typography.h4,
    color: '#000',
    marginBottom: 12,
  },
  summaryItem: {
    ...Typography.body,
    color: '#333',
    marginBottom: 4,
  },
  restartButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  restartButtonText: {
    ...Typography.button,
    color: '#000',
  },
});

export default TasteChatbot;
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { ChatbotQuestion, ChatbotResponse, CatalogItem } from '../types';
import { useCatalog } from '../contexts/CatalogContext';
import ProductCard from './ProductCard';

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
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      {/* Animated Background GIF */}
      <View style={styles.backgroundContainer}>
        <Image
          source={{ 
            uri: 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif' 
          }}
          style={styles.backgroundGif}
          resizeMode="cover"
        />
        <View style={styles.overlayGradient} />
      </View>

      {/* Coffee Animation GIF */}
      <View style={styles.sideAnimationContainer}>
        <Image
          source={{ 
            uri: 'https://media.giphy.com/media/5nkXJZbsF9xL8O8M28/giphy.gif' 
          }}
          style={styles.sideAnimation}
          resizeMode="contain"
        />
      </View>

      <View style={styles.chatbotCard}>
        <View style={styles.welcomeHeader}>
          <Text style={styles.welcomeTitle}>☕ Coffee Taste Assistant</Text>
          <Text style={styles.welcomeSubtitle}>
            Let's find your perfect brew! Answer a few questions and discover coffee that matches your taste.
          </Text>
        </View>

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

      {/* Decorative Coffee Elements */}
      <View style={styles.decorativeElements}>
        <Image
          source={{ 
            uri: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif' 
          }}
          style={styles.decorativeGif1}
          resizeMode="contain"
        />
        <Image
          source={{ 
            uri: 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif' 
          }}
          style={styles.decorativeGif2}
          resizeMode="cover"
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
    minHeight: 600,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  backgroundGif: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  overlayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  sideAnimationContainer: {
    position: 'absolute',
    top: 20,
    right: -120,
    zIndex: 1,
  },
  sideAnimation: {
    width: 150,
    height: 150,
    opacity: 0.7,
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  decorativeGif1: {
    position: 'absolute',
    bottom: 50,
    left: -50,
    width: 80,
    height: 80,
    opacity: 0.6,
  },
  decorativeGif2: {
    position: 'absolute',
    top: 150,
    right: -80,
    width: 60,
    height: 60,
    opacity: 0.4,
  },
  chatbotCard: {
    padding: 20,
    backgroundColor: 'rgba(248, 249, 250, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    backdropFilter: 'blur(10px)',
    zIndex: 2,
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  progressContainer: {
    marginTop: 20,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    lineHeight: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: 'white',
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
    fontSize: 14,
    fontWeight: '600',
    color: '#6f42c1',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  backButtonText: {
    fontSize: 14,
    color: '#666',
  },
  completionHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  completionSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  recommendationContainer: {
    marginBottom: 24,
    alignItems: 'flex-start',
    maxWidth: 300,
  },
  summaryContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  summaryItem: {
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
});

export default TasteChatbot;
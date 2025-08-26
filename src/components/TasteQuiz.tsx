import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { ChatbotQuestion, ChatbotResponse, CatalogItem } from '../types';
import { useCatalog } from '../contexts/CatalogContext';
import { useContent } from '../contexts/ContentContext';
import ProductCard from './ProductCard';
import { Colors, Typography, Spacing, Layout, BorderRadius, Shadows, createTypographyStyle } from '../utils/designSystem';

interface TasteQuizProps {
  onProductRecommended?: (product: CatalogItem) => void;
  onProductPress?: (product: CatalogItem) => void;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  isModal?: boolean;
  visible?: boolean;
  onClose?: () => void;
  title?: string;
}

const TasteQuiz: React.FC<TasteQuizProps> = ({
  onProductRecommended,
  onProductPress,
  deviceType,
  isModal = false,
  title = "Coffee Taste Assistant",
  visible = true,
  onClose,
}) => {
  const { getRecommendedItem } = useCatalog();
  const { contentData } = useContent();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<ChatbotResponse>({});
  const [recommendedProduct, setRecommendedProduct] = useState<CatalogItem | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const { width: screenWidth } = Dimensions.get('window');
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';

  const questions: ChatbotQuestion[] = [
    {
      id: 'brew-style',
      question: 'How do you prefer to brew your coffee?',
      options: [
        { label: 'Espresso', icon: '☕', description: 'Rich, concentrated shots' },
        { label: 'Pour-over', icon: '🫗', description: 'Clean, bright flavors' },
        { label: 'French Press', icon: '🫘', description: 'Full-bodied, immersive' },
        { label: 'Cold Brew', icon: '🧊', description: 'Smooth, less acidic' },
      ],
      type: 'brew-style',
    },
    {
      id: 'roast-profile',
      question: 'What roast level speaks to you?',
      options: [
        { label: 'Light Roast', icon: '🌅', description: 'Bright, acidic, complex' },
        { label: 'Medium Roast', icon: '☀️', description: 'Balanced, smooth, versatile' },
        { label: 'Dark Roast', icon: '🌃', description: 'Bold, smoky, robust' },
      ],
      type: 'roast-profile',
    },
    {
      id: 'flavor-direction',
      question: 'Which flavor journey excites you most?',
      options: [
        { label: 'Bright & Floral', icon: '🌸', description: 'Tea-like, delicate, fruity' },
        { label: 'Balanced & Sweet', icon: '🍯', description: 'Caramel, chocolate, nutty' },
        { label: 'Bold & Earthy', icon: '🌿', description: 'Spicy, woody, intense' },
      ],
      type: 'flavor-direction',
    },
    {
      id: 'origin-preference',
      question: 'Any origin that catches your curiosity?',
      options: [
        { label: 'Ethiopian', icon: '🇪🇹', description: 'Birthplace of coffee' },
        { label: 'Colombian', icon: '🇨🇴', description: 'Classic, well-rounded' },
        { label: 'Guatemalan', icon: '🇬🇹', description: 'Rich, full-bodied' },
        { label: 'Surprise Me', icon: '🎲', description: "I'm open to anything" },
      ],
      type: 'origin-preference',
    },
    {
      id: 'brewing-time',
      question: 'How much time do you typically have for brewing?',
      options: [
        { label: 'Quick (1-2 min)', icon: '⚡', description: 'Espresso, instant' },
        { label: 'Moderate (3-5 min)', icon: '⏰', description: 'Pour-over, AeroPress' },
        { label: 'Patient (5+ min)', icon: '🧘', description: 'French press, cold brew' },
      ],
      type: 'brewing-time',
    },
    {
      id: 'coffee-strength',
      question: 'How strong do you like your coffee?',
      options: [
        { label: 'Mild', icon: '☁️', description: 'Gentle, approachable' },
        { label: 'Medium', icon: '🌤️', description: 'Balanced strength' },
        { label: 'Strong', icon: '⚡', description: 'Bold, intense' },
      ],
      type: 'coffee-strength',
    },
    {
      id: 'drinking-time',
      question: 'When do you most enjoy your coffee?',
      options: [
        { label: 'Morning Kickstart', icon: '🌅', description: 'Energy for the day' },
        { label: 'Afternoon Boost', icon: '☀️', description: 'Midday pick-me-up' },
        { label: 'Evening Ritual', icon: '🌙', description: 'Relaxing moment' },
        { label: 'All Day Long', icon: '🔄', description: 'Coffee is life' },
      ],
      type: 'drinking-time',
    },
  ];

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const mapAnswerToValue = (answer: string, type: string) => {
    const mappings: Record<string, Record<string, string>> = {
      'brew-style': {
        'Espresso': 'espresso',
        'Pour-over': 'filter',
        'French Press': 'french-press',
        'Cold Brew': 'cold-brew',
      },
      'roast-profile': {
        'Light Roast': 'light',
        'Medium Roast': 'medium',
        'Dark Roast': 'dark',
      },
      'flavor-direction': {
        'Bright & Floral': 'floral',
        'Balanced & Sweet': 'balanced',
        'Bold & Earthy': 'smoky',
      },
    };
    
    return mappings[type]?.[answer] || answer.toLowerCase().replace(/\s+/g, '-');
  };

  const handleAnswerSelect = (answer: string) => {
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
      default:
        (newResponses as any)[currentQuestion.type] = mappedValue;
    }

    setResponses(newResponses);

    if (isLastQuestion) {
      // Complete quiz and get recommendation
      const recommendation = getRecommendedItem(
        newResponses.brewStyle,
        newResponses.roastProfile,
        newResponses.flavorDirection
      );

      if (recommendation) {
        setRecommendedProduct(recommendation);
        setIsCompleted(true);
        onProductRecommended?.(recommendation);
      }
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setResponses({});
    setRecommendedProduct(null);
    setIsCompleted(false);
  };

  const handleSkip = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const renderQuizContent = () => {
    if (isCompleted && recommendedProduct) {
      return (
        <View style={styles.completedContainer}>
          {/* Success Header */}
          <View style={styles.successHeader}>
            <Text style={styles.successIcon}>✨</Text>
            <Text style={styles.successTitle}>Perfect Match Found!</Text>
            <Text style={styles.successSubtitle}>
              Based on your preferences, we recommend:
            </Text>
          </View>

          {/* Recommended Product */}
          <View style={styles.recommendationContainer}>
            <ProductCard
              product={recommendedProduct}
              variant="featured"
              onPress={onProductPress}
            />
          </View>

          {/* Quiz Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Your Taste Profile:</Text>
            <View style={styles.summaryTags}>
              {Object.entries(responses).map(([key, value]) => (
                value && (
                  <View key={key} style={styles.summaryTag}>
                    <Text style={styles.summaryTagText}>{String(value)}</Text>
                  </View>
                )
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.completedActions}>
            <Pressable 
              style={[styles.button, styles.secondaryButton]}
              onPress={handleRestart}
              accessibilityRole="button"
              accessibilityLabel="Retake quiz with different preferences"
            >
              <Text style={styles.secondaryButtonText}>Try Again</Text>
            </Pressable>
            
            <Pressable 
              style={[styles.button, styles.primaryButton]}
              onPress={() => onProductPress?.(recommendedProduct)}
              accessibilityRole="button"
              accessibilityLabel="View recommended product details"
            >
              <Text style={styles.primaryButtonText}>View Product</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.quizContainer}>
        {/* Quiz Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.quizTitle}>{title}</Text>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Q{currentQuestionIndex + 1} of {questions.length}
          </Text>
        </View>

        {/* Question */}
        <View style={styles.questionContainer}>
          <Text 
            style={styles.questionText}
            accessibilityRole="header"
            accessibilityLevel={2}
          >
            {currentQuestion.question}
          </Text>
        </View>

        {/* Answer Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const optionData = typeof option === 'string' 
              ? { label: option, icon: '', description: '' }
              : option;
              
            return (
              <Pressable
                key={index}
                style={styles.optionCard}
                onPress={() => handleAnswerSelect(optionData.label)}
                accessibilityRole="button"
                accessibilityLabel={`${optionData.label}. ${optionData.description}`}
              >
                <View style={styles.optionHeader}>
                  <Text style={styles.optionIcon}>{optionData.icon}</Text>
                  <Text style={styles.optionLabel}>{optionData.label}</Text>
                </View>
                {optionData.description && (
                  <Text style={styles.optionDescription}>{optionData.description}</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Navigation Controls */}
        <View style={styles.controlsContainer}>
          <Pressable
            style={[styles.controlButton, currentQuestionIndex === 0 && styles.controlButtonDisabled]}
            onPress={handleBack}
            disabled={currentQuestionIndex === 0}
            accessibilityRole="button"
            accessibilityLabel="Go back to previous question"
          >
            <Text style={[styles.controlButtonText, currentQuestionIndex === 0 && styles.controlButtonTextDisabled]}>
              ← Back
            </Text>
          </Pressable>

          <Pressable
            style={styles.controlButton}
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel="Skip this question"
          >
            <Text style={styles.controlButtonText}>Skip →</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const quizContent = (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      {/* Header */}
      {isModal && (
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Coffee Taste Quiz</Text>
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close quiz"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>
      )}

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderQuizContent()}
      </ScrollView>
    </View>
  );

  if (isModal) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle={isMobile ? "pageSheet" : "formSheet"}
        onRequestClose={onClose}
      >
        {quizContent}
      </Modal>
    );
  }

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.card}>
        {quizContent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Card Wrapper (for embedded version)
  cardWrapper: {
    padding: Spacing.md,
    maxWidth: Layout.maxWidth,
    alignSelf: 'center',
    width: '100%',
  },

  card: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    ...Shadows.lg,
    overflow: 'hidden',
  },

  // Container
  container: {
    backgroundColor: Colors.surface.primary,
    minHeight: 600,
  },

  containerMobile: {
    minHeight: '100%',
  },

  // Modal Header
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface.secondary,
  },

  modalTitle: {
    ...createTypographyStyle('h4', 'serif', Colors.text.primary),
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButtonText: {
    fontSize: 18,
    color: Colors.text.tertiary,
  },

  // Scroll Container
  scrollContainer: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: Spacing.xxl,
  },

  // Quiz Container
  quizContainer: {
    padding: Spacing.xl,
  },
  
  titleContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  
  quizTitle: {
    ...createTypographyStyle('h3', 'serif', Colors.text.primary),
    textAlign: 'center',
    fontWeight: Typography.weights.bold,
  },

  // Progress
  progressContainer: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },

  progressBar: {
    height: 6,
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.sm,
    width: '100%',
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.sm,
  },

  progressText: {
    ...createTypographyStyle('caption', 'sansSerif', Colors.text.tertiary),
    fontWeight: Typography.weights.medium,
  },

  // Question
  questionContainer: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },

  questionText: {
    ...createTypographyStyle('h3', 'serif', Colors.text.primary),
    textAlign: 'center',
    lineHeight: 36,
  },

  // Options
  optionsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },

  optionCard: {
    backgroundColor: Colors.surface.primary,
    borderWidth: 2,
    borderColor: Colors.surface.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    minHeight: Layout.minTouchTarget + 20,
    justifyContent: 'center',
  },

  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },

  optionIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },

  optionLabel: {
    ...createTypographyStyle('body', 'sansSerif', Colors.text.primary),
    fontWeight: Typography.weights.semiBold,
    flex: 1,
  },

  optionDescription: {
    ...createTypographyStyle('bodySmall', 'sansSerif', Colors.text.tertiary),
    marginLeft: 40, // Align with label after icon
  },

  // Controls
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  controlButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    minHeight: Layout.minTouchTarget,
    justifyContent: 'center',
  },

  controlButtonDisabled: {
    opacity: 0.5,
  },

  controlButtonText: {
    ...createTypographyStyle('body', 'sansSerif', Colors.primary),
    fontWeight: Typography.weights.medium,
  },

  controlButtonTextDisabled: {
    color: Colors.text.tertiary,
  },

  // Completed State
  completedContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },

  successHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },

  successIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },

  successTitle: {
    ...createTypographyStyle('h3', 'serif', Colors.text.primary),
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },

  successSubtitle: {
    ...createTypographyStyle('body', 'sansSerif', Colors.text.secondary),
    textAlign: 'center',
  },

  recommendationContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: Spacing.xl,
  },

  summaryContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },

  summaryTitle: {
    ...createTypographyStyle('h6', 'sansSerif', Colors.text.primary),
    marginBottom: Spacing.md,
  },

  summaryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },

  summaryTag: {
    backgroundColor: Colors.surface.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },

  summaryTagText: {
    ...createTypographyStyle('bodySmall', 'sansSerif', Colors.text.secondary),
    fontWeight: Typography.weights.medium,
    textTransform: 'capitalize',
  },

  completedActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
    maxWidth: 400,
  },

  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Layout.minTouchTarget,
  },

  primaryButton: {
    backgroundColor: Colors.primary,
  },

  primaryButtonText: {
    ...createTypographyStyle('button', 'sansSerif', Colors.text.inverse),
    fontWeight: Typography.weights.semiBold,
  },

  secondaryButton: {
    backgroundColor: Colors.surface.secondary,
    borderWidth: 1,
    borderColor: Colors.text.tertiary,
  },

  secondaryButtonText: {
    ...createTypographyStyle('button', 'sansSerif', Colors.text.secondary),
    fontWeight: Typography.weights.medium,
  },
});

export default TasteQuiz;
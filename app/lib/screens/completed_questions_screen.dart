import 'package:expressive_loading_indicator/expressive_loading_indicator.dart';
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/question.dart';
import '../services/firestore_service.dart';
import 'question_detail_screen.dart';

class CompletedQuestionsScreen extends StatefulWidget {
  const CompletedQuestionsScreen({super.key});

  @override
  State<CompletedQuestionsScreen> createState() =>
      _CompletedQuestionsScreenState();
}

class _CompletedQuestionsScreenState extends State<CompletedQuestionsScreen> {
  final FirestoreService _firestoreService = FirestoreService();
  final User? _currentUser = FirebaseAuth.instance.currentUser;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(title: const Text('완료된 질의응답')),
      body: StreamBuilder<List<Question>>(
        stream: _firestoreService.getCompletedQuestions(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: ExpressiveLoadingIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text('오류가 발생했습니다: ${snapshot.error}'));
          }

          final questions = snapshot.data ?? [];

          if (questions.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.check_circle_outline,
                    size: 80,
                    color: colorScheme.onSurfaceVariant.withValues(alpha: 0.5),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    '완료된 질의응답이 없습니다',
                    style: textTheme.titleLarge?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '답변이 있는 질문이 여기에 표시됩니다',
                    style: textTheme.bodyMedium?.copyWith(
                      color: colorScheme.onSurfaceVariant.withValues(
                        alpha: 0.7,
                      ),
                    ),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: questions.length,
            itemBuilder: (context, index) {
              final question = questions[index];
              final isQuestioner = question.questioner == _currentUser?.uid;

              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: InkWell(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) =>
                            QuestionDetailScreen(questionId: question.id),
                      ),
                    );
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                question.title,
                                style: textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: colorScheme.tertiaryContainer,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    Icons.check_circle,
                                    size: 14,
                                    color: colorScheme.onTertiaryContainer,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    '완료',
                                    style: textTheme.labelSmall?.copyWith(
                                      color: colorScheme.onTertiaryContainer,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          question.content,
                          style: textTheme.bodyMedium?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Icon(
                              isQuestioner
                                  ? Icons.person
                                  : Icons.person_outline,
                              size: 16,
                              color: colorScheme.primary,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              isQuestioner ? '내 질문' : '답변한 질문',
                              style: textTheme.labelSmall?.copyWith(
                                color: colorScheme.primary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: colorScheme.primaryContainer,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    '${question.answers.length}',
                                    style: textTheme.labelSmall?.copyWith(
                                      color: colorScheme.onPrimaryContainer,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(width: 2),
                                  Text(
                                    '답변',
                                    style: textTheme.labelSmall?.copyWith(
                                      color: colorScheme.onPrimaryContainer,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import '../models/question.dart';
import '../services/firestore_service.dart';

class QuestionDetailScreen extends StatefulWidget {
  final String questionId;

  const QuestionDetailScreen({super.key, required this.questionId});

  @override
  State<QuestionDetailScreen> createState() => _QuestionDetailScreenState();
}

class _QuestionDetailScreenState extends State<QuestionDetailScreen> {
  final FirestoreService _firestoreService = FirestoreService();
  final User? _currentUser = FirebaseAuth.instance.currentUser;
  final TextEditingController _messageController = TextEditingController();
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _contentController = TextEditingController();

  @override
  void dispose() {
    _messageController.dispose();
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _sendMessage(String questionId, String sender) async {
    if (_messageController.text.trim().isEmpty) return;

    try {
      await _firestoreService.addAnswer(
        questionId: questionId,
        content: _messageController.text.trim(),
        sender: sender,
      );
      _messageController.clear();
      // Don't show SnackBar to avoid covering the message input
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('메시지 전송 실패: $e'),
            behavior: SnackBarBehavior.floating,
            margin: const EdgeInsets.only(bottom: 80, left: 16, right: 16),
          ),
        );
      }
    }
  }

  Future<void> _showEditDialog(Question question) async {
    _titleController.text = question.title;
    _contentController.text = question.content;
    final formKey = GlobalKey<FormState>();

    return showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('질문 수정'),
          content: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: _titleController,
                  decoration: const InputDecoration(
                    labelText: '제목',
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return '제목을 입력하세요';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _contentController,
                  decoration: const InputDecoration(
                    labelText: '내용',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 5,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return '내용을 입력하세요';
                    }
                    return null;
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('취소'),
            ),
            FilledButton(
              onPressed: () async {
                if (formKey.currentState!.validate()) {
                  try {
                    await _firestoreService.updateQuestion(
                      questionId: question.id,
                      title: _titleController.text,
                      content: _contentController.text,
                    );
                    if (mounted) {
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('질문이 수정되었습니다'),
                          behavior: SnackBarBehavior.floating,
                          margin: EdgeInsets.only(
                            bottom: 80,
                            left: 16,
                            right: 16,
                          ),
                        ),
                      );
                    }
                  } catch (e) {
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('질문 수정 실패: $e'),
                          behavior: SnackBarBehavior.floating,
                          margin: const EdgeInsets.only(
                            bottom: 80,
                            left: 16,
                            right: 16,
                          ),
                        ),
                      );
                    }
                  }
                }
              },
              child: const Text('수정'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _deleteQuestion(String questionId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('질문 삭제'),
          content: const Text('정말로 이 질문을 삭제하시겠습니까?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('취소'),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(context, true),
              style: FilledButton.styleFrom(
                backgroundColor: Theme.of(context).colorScheme.error,
              ),
              child: const Text('삭제'),
            ),
          ],
        );
      },
    );

    if (confirmed == true) {
      try {
        await _firestoreService.deleteQuestion(questionId);
        if (mounted) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('질문이 삭제되었습니다'),
              behavior: SnackBarBehavior.floating,
              margin: EdgeInsets.only(bottom: 80, left: 16, right: 16),
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('질문 삭제 실패: $e'),
              behavior: SnackBarBehavior.floating,
              margin: const EdgeInsets.only(bottom: 80, left: 16, right: 16),
            ),
          );
        }
      }
    }
  }

  Future<void> _toggleCompleted(
    String questionId,
    bool currentStatus,
    int answersCount,
  ) async {
    // Prevent completing if there are no answers
    if (!currentStatus && answersCount == 0) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('답변이 없는 질문은 완료할 수 없습니다'),
            behavior: SnackBarBehavior.floating,
            margin: EdgeInsets.only(bottom: 80, left: 16, right: 16),
          ),
        );
      }
      return;
    }

    try {
      await _firestoreService.toggleCompleted(questionId, !currentStatus);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(!currentStatus ? '질문이 완료되었습니다' : '질문을 미완료로 변경했습니다'),
            behavior: SnackBarBehavior.floating,
            margin: const EdgeInsets.only(bottom: 80, left: 16, right: 16),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('상태 변경 실패: $e'),
            behavior: SnackBarBehavior.floating,
            margin: const EdgeInsets.only(bottom: 80, left: 16, right: 16),
          ),
        );
      }
    }
  }

  Future<void> _showEditMessageDialog(
    String questionId,
    int answerIndex,
    String currentContent,
  ) async {
    final contentController = TextEditingController(text: currentContent);
    final formKey = GlobalKey<FormState>();

    return showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('메시지 수정'),
          content: Form(
            key: formKey,
            child: TextFormField(
              controller: contentController,
              decoration: const InputDecoration(
                labelText: '내용',
                border: OutlineInputBorder(),
              ),
              maxLines: 5,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return '내용을 입력하세요';
                }
                return null;
              },
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('취소'),
            ),
            FilledButton(
              onPressed: () async {
                if (formKey.currentState!.validate()) {
                  try {
                    await _firestoreService.updateAnswer(
                      questionId: questionId,
                      answerIndex: answerIndex,
                      newContent: contentController.text,
                    );
                    if (mounted) {
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('메시지가 수정되었습니다'),
                          behavior: SnackBarBehavior.floating,
                          margin: EdgeInsets.only(
                            bottom: 80,
                            left: 16,
                            right: 16,
                          ),
                        ),
                      );
                    }
                  } catch (e) {
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('메시지 수정 실패: $e'),
                          behavior: SnackBarBehavior.floating,
                          margin: const EdgeInsets.only(
                            bottom: 80,
                            left: 16,
                            right: 16,
                          ),
                        ),
                      );
                    }
                  }
                }
              },
              child: const Text('수정'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _deleteMessage(String questionId, int answerIndex) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('메시지 삭제'),
          content: const Text('정말로 이 메시지를 삭제하시겠습니까?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('취소'),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(context, true),
              style: FilledButton.styleFrom(
                backgroundColor: Theme.of(context).colorScheme.error,
              ),
              child: const Text('삭제'),
            ),
          ],
        );
      },
    );

    if (confirmed == true) {
      try {
        await _firestoreService.deleteAnswer(
          questionId: questionId,
          answerIndex: answerIndex,
        );
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('메시지가 삭제되었습니다'),
              behavior: SnackBarBehavior.floating,
              margin: EdgeInsets.only(bottom: 80, left: 16, right: 16),
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('메시지 삭제 실패: $e'),
              behavior: SnackBarBehavior.floating,
              margin: const EdgeInsets.only(bottom: 80, left: 16, right: 16),
            ),
          );
        }
      }
    }
  }

  void _showMessageOptions(
    BuildContext context,
    String questionId,
    int answerIndex,
    String currentContent,
  ) {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.edit),
                title: const Text('수정'),
                onTap: () {
                  Navigator.pop(context);
                  _showEditMessageDialog(
                    questionId,
                    answerIndex,
                    currentContent,
                  );
                },
              ),
              ListTile(
                leading: const Icon(Icons.delete),
                title: const Text('삭제'),
                onTap: () {
                  Navigator.pop(context);
                  _deleteMessage(questionId, answerIndex);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return StreamBuilder<Question?>(
      stream: _firestoreService.getQuestion(widget.questionId),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        if (snapshot.hasError || !snapshot.hasData || snapshot.data == null) {
          return Scaffold(
            appBar: AppBar(title: const Text('오류')),
            body: const Center(child: Text('질문을 불러올 수 없습니다')),
          );
        }

        final question = snapshot.data!;
        final isQuestioner = question.questioner == _currentUser?.uid;
        final isAssignee = question.assignee == _currentUser?.uid;
        final hasAssignee = question.assignee != null;

        return Scaffold(
          appBar: AppBar(
            title: Text(hasAssignee ? '1:1 질문' : '질문 상세'),
            actions: [
              if (hasAssignee && (isQuestioner || isAssignee))
                IconButton(
                  icon: Icon(
                    question.completed
                        ? Icons.check_circle
                        : Icons.check_circle_outline,
                  ),
                  tooltip: question.completed ? '미완료로 변경' : '완료로 변경',
                  onPressed: () => _toggleCompleted(
                    question.id,
                    question.completed,
                    question.answers.length,
                  ),
                ),
              if (isQuestioner && !hasAssignee) ...[
                IconButton(
                  icon: const Icon(Icons.edit),
                  tooltip: '수정',
                  onPressed: () => _showEditDialog(question),
                ),
              ],
            ],
          ),
          body: Column(
            children: [
              // Question Information Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: colorScheme.surfaceContainerHighest,
                  border: Border(
                    bottom: BorderSide(
                      color: colorScheme.outlineVariant,
                      width: 1,
                    ),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            question.title,
                            style: textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        if (hasAssignee)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: colorScheme.primaryContainer,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                question.completed
                                    ? Icon(
                                        Icons.check,
                                        size: 16,
                                        color: colorScheme.onPrimaryContainer,
                                      )
                                    : Icon(
                                        Icons.chat_bubble,
                                        size: 16,
                                        color: colorScheme.onPrimaryContainer,
                                      ),
                                const SizedBox(width: 6),
                                Text(
                                  question.completed ? '완료' : '채팅 중',
                                  style: textTheme.labelMedium?.copyWith(
                                    color: colorScheme.onPrimaryContainer,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      question.content,
                      style: textTheme.bodyLarge?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: isQuestioner
                                ? colorScheme.secondaryContainer
                                : colorScheme.tertiaryContainer,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                isQuestioner
                                    ? Icons.person
                                    : Icons.person_outline,
                                size: 14,
                                color: isQuestioner
                                    ? colorScheme.onSecondaryContainer
                                    : colorScheme.onTertiaryContainer,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                isQuestioner ? '질문자' : '답변자',
                                style: textTheme.labelSmall?.copyWith(
                                  color: isQuestioner
                                      ? colorScheme.onSecondaryContainer
                                      : colorScheme.onTertiaryContainer,
                                  fontWeight: FontWeight.w600,
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

              // Chat or Answer Section
              Expanded(
                child: hasAssignee
                    ? _buildChatInterface(question, isQuestioner, isAssignee)
                    : _buildNoAssigneeView(question),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildChatInterface(
    Question question,
    bool isQuestioner,
    bool isAssignee,
  ) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    // Show accept/decline UI if assignee hasn't accepted yet and no answers
    if (isAssignee && 
        question.acceptedByAssignee != true && 
        question.answers.isEmpty) {
      return _buildAcceptDeclineView(question);
    }

    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: question.answers.length,
            itemBuilder: (context, index) {
              final answer = question.answers[index];
              final isFromQuestioner = answer.sender == 'questioner';
              final isMine =
                  (isQuestioner && isFromQuestioner) ||
                  (isAssignee && !isFromQuestioner);

              return Align(
                alignment: isFromQuestioner
                    ? Alignment.centerLeft
                    : Alignment.centerRight,
                child: GestureDetector(
                  onLongPress: isMine && !question.completed
                      ? () => _showMessageOptions(
                          context,
                          question.id,
                          index,
                          answer.content,
                        )
                      : null,
                  child: Container(
                    constraints: BoxConstraints(
                      maxWidth: MediaQuery.of(context).size.width * 0.75,
                    ),
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: isMine
                          ? colorScheme.primaryContainer
                          : colorScheme.surfaceContainerHigh,
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(16),
                        topRight: const Radius.circular(16),
                        bottomLeft: isFromQuestioner
                            ? const Radius.circular(4)
                            : const Radius.circular(16),
                        bottomRight: isFromQuestioner
                            ? const Radius.circular(16)
                            : const Radius.circular(4),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              isFromQuestioner
                                  ? Icons.person
                                  : Icons.person_outline,
                              size: 14,
                              color: isMine
                                  ? colorScheme.onPrimaryContainer
                                  : colorScheme.primary,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              isFromQuestioner ? '질문자' : '답변자',
                              style: textTheme.labelSmall?.copyWith(
                                color: isMine
                                    ? colorScheme.onPrimaryContainer
                                    : colorScheme.primary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Builder(
                          builder: (context) {
                            try {
                              return MarkdownBody(
                                data: answer.content,
                                styleSheet: MarkdownStyleSheet(
                                  p: textTheme.bodyMedium?.copyWith(
                                    color: isMine
                                        ? colorScheme.onPrimaryContainer
                                        : colorScheme.onSurface,
                                  ),
                                  code: textTheme.bodySmall?.copyWith(
                                    color: isMine
                                        ? colorScheme.onPrimaryContainer
                                        : colorScheme.onSurface,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                              );
                            } catch (e) {
                              // Fallback to plain text if markdown rendering fails
                              return Text(
                                answer.content,
                                style: textTheme.bodyMedium?.copyWith(
                                  color: isMine
                                      ? colorScheme.onPrimaryContainer
                                      : colorScheme.onSurface,
                                ),
                              );
                            }
                          },
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),

        // Message Input (for both questioner and assignee)
        if (isQuestioner || isAssignee)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: colorScheme.surface,
              border: Border(
                top: BorderSide(color: colorScheme.outlineVariant, width: 1),
              ),
            ),
            child: SafeArea(
              top: false,
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      decoration: InputDecoration(
                        hintText: question.completed
                            ? '완료된 질문입니다. 메시지를 보내려면 완료를 해제하세요.'
                            : '메시지를 입력하세요...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                      ),
                      maxLines: null,
                      enabled: !question.completed,
                    ),
                  ),
                  const SizedBox(width: 8),
                  FilledButton(
                    onPressed: question.completed
                        ? null
                        : () => _sendMessage(
                            question.id,
                            isQuestioner ? 'questioner' : 'answerer',
                          ),
                    style: FilledButton.styleFrom(
                      shape: const CircleBorder(),
                      padding: const EdgeInsets.all(12),
                    ),
                    child: const Icon(Icons.send),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildNoAssigneeView(Question question) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.pending_outlined,
              size: 80,
              color: colorScheme.onSurfaceVariant.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 16),
            Text(
              '아직 답변자가 배정되지 않았습니다',
              style: textTheme.titleLarge?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              '답변자가 배정되면 1:1 질문을 시작할 수 있습니다',
              style: textTheme.bodyMedium?.copyWith(
                color: colorScheme.onSurfaceVariant.withValues(alpha: 0.7),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAcceptDeclineView(Question question) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.question_answer_outlined,
              size: 80,
              color: colorScheme.primary,
            ),
            const SizedBox(height: 24),
            Text(
              '새로운 질문이 배정되었습니다',
              style: textTheme.titleLarge?.copyWith(
                color: colorScheme.onSurface,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            Text(
              '이 질문에 답변하시겠습니까?',
              style: textTheme.bodyLarge?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _handleDeclineQuestion(question.id),
                    icon: const Icon(Icons.close),
                    label: const Text('거절'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      foregroundColor: colorScheme.error,
                      side: BorderSide(color: colorScheme.error),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: FilledButton.icon(
                    onPressed: () => _handleAcceptQuestion(question.id),
                    icon: const Icon(Icons.check),
                    label: const Text('수락'),
                    style: FilledButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              '거절하면 다른 답변자에게 배정됩니다',
              style: textTheme.bodySmall?.copyWith(
                color: colorScheme.onSurfaceVariant.withValues(alpha: 0.6),
                fontStyle: FontStyle.italic,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleAcceptQuestion(String questionId) async {
    try {
      await _firestoreService.acceptQuestion(questionId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('질문을 수락했습니다. 답변을 시작하세요!'),
            behavior: SnackBarBehavior.floating,
            margin: EdgeInsets.only(bottom: 80, left: 16, right: 16),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('질문 수락 실패: $e'),
            behavior: SnackBarBehavior.floating,
            margin: const EdgeInsets.only(bottom: 80, left: 16, right: 16),
          ),
        );
      }
    }
  }

  Future<void> _handleDeclineQuestion(String questionId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('질문 거절'),
          content: const Text('정말로 이 질문을 거절하시겠습니까? 다른 답변자에게 배정됩니다.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('취소'),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(context, true),
              style: FilledButton.styleFrom(
                backgroundColor: Theme.of(context).colorScheme.error,
              ),
              child: const Text('거절'),
            ),
          ],
        );
      },
    );

    if (confirmed == true) {
      try {
        await _firestoreService.declineQuestion(questionId);
        if (mounted) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('질문을 거절했습니다'),
              behavior: SnackBarBehavior.floating,
              margin: EdgeInsets.only(bottom: 80, left: 16, right: 16),
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('질문 거절 실패: $e'),
              behavior: SnackBarBehavior.floating,
              margin: const EdgeInsets.only(bottom: 80, left: 16, right: 16),
            ),
          );
        }
      }
    }
  }
}

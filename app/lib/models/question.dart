import 'package:cloud_firestore/cloud_firestore.dart';

class Question {
  final String id;
  final String title;
  final String content;
  final String questioner; // UID of the user who asked
  final String? assignee; // UID of the answerer (optional)
  final String? answer; // Answer text (optional)
  final DateTime createdAt;
  final DateTime? updatedAt;

  Question({
    required this.id,
    required this.title,
    required this.content,
    required this.questioner,
    this.assignee,
    this.answer,
    required this.createdAt,
    this.updatedAt,
  });

  // Create Question from Firestore document
  factory Question.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return Question(
      id: doc.id,
      title: data['title'] ?? '',
      content: data['content'] ?? '',
      questioner: data['questioner'] ?? '',
      assignee: data['assignee'],
      answer: data['answer'],
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate(),
    );
  }

  // Convert Question to Firestore document
  Map<String, dynamic> toFirestore() {
    return {
      'title': title,
      'content': content,
      'questioner': questioner,
      if (assignee != null) 'assignee': assignee,
      if (answer != null) 'answer': answer,
      'createdAt': Timestamp.fromDate(createdAt),
      if (updatedAt != null) 'updatedAt': Timestamp.fromDate(updatedAt!),
    };
  }

  // Copy with method for updates
  Question copyWith({
    String? id,
    String? title,
    String? content,
    String? questioner,
    String? assignee,
    String? answer,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Question(
      id: id ?? this.id,
      title: title ?? this.title,
      content: content ?? this.content,
      questioner: questioner ?? this.questioner,
      assignee: assignee ?? this.assignee,
      answer: answer ?? this.answer,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

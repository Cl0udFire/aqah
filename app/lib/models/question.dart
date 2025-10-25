import 'package:cloud_firestore/cloud_firestore.dart';

class Answer {
  final String content;
  final String sender; // "questioner" or "answerer"
  final DateTime timestamp;

  Answer({
    required this.content,
    required this.sender,
    required this.timestamp,
  });

  factory Answer.fromMap(Map<String, dynamic> map) {
    return Answer(
      content: map['content'] ?? '',
      sender: map['sender'] ?? 'questioner',
      timestamp: (map['timestamp'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'content': content,
      'sender': sender,
      'timestamp': Timestamp.fromDate(timestamp),
    };
  }
}

class Question {
  final String id;
  final String title;
  final String content;
  final String questioner;
  final String? assignee;
  final List<Answer> answers;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool completed;
  final List<String> declinedBy;
  final bool? acceptedByAssignee;

  Question({
    required this.id,
    required this.title,
    required this.content,
    required this.questioner,
    this.assignee,
    List<Answer>? answers,
    required this.createdAt,
    required this.updatedAt,
    this.completed = false,
    List<String>? declinedBy,
    this.acceptedByAssignee,
  }) : answers = answers ?? [],
       declinedBy = declinedBy ?? [];

  factory Question.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    List<Answer> answersList = [];
    
    if (data['answers'] != null) {
      answersList = (data['answers'] as List)
          .map((item) => Answer.fromMap(item as Map<String, dynamic>))
          .toList();
    }
    
    List<String> declinedByList = [];
    if (data['declinedBy'] != null) {
      declinedByList = List<String>.from(data['declinedBy'] as List);
    }
    
    return Question(
      id: doc.id,
      title: data['title'] ?? '',
      content: data['content'] ?? '',
      questioner: data['questioner'] ?? '',
      assignee: data['assignee'],
      answers: answersList,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (data['updatedAt'] as Timestamp).toDate(),
      completed: data['completed'] ?? false,
      declinedBy: declinedByList,
      acceptedByAssignee: data['acceptedByAssignee'],
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'title': title,
      'content': content,
      'questioner': questioner,
      if (assignee != null) 'assignee': assignee,
      'answers': answers.map((answer) => answer.toMap()).toList(),
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
      'completed': completed,
      'declinedBy': declinedBy,
      if (acceptedByAssignee != null) 'acceptedByAssignee': acceptedByAssignee,
    };
  }

  Question copyWith({
    String? id,
    String? title,
    String? content,
    String? questioner,
    String? assignee,
    List<Answer>? answers,
    DateTime? createdAt,
    DateTime? updatedAt,
    bool? completed,
    List<String>? declinedBy,
    bool? acceptedByAssignee,
  }) {
    return Question(
      id: id ?? this.id,
      title: title ?? this.title,
      content: content ?? this.content,
      questioner: questioner ?? this.questioner,
      assignee: assignee ?? this.assignee,
      answers: answers ?? this.answers,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      completed: completed ?? this.completed,
      declinedBy: declinedBy ?? this.declinedBy,
      acceptedByAssignee: acceptedByAssignee ?? this.acceptedByAssignee,
    );
  }
}

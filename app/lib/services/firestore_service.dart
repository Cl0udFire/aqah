import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/question.dart';

class FirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // Get current user ID
  String? get currentUserId => _auth.currentUser?.uid;

  // Create a new question
  Future<void> createQuestion({
    required String title,
    required String content,
  }) async {
    if (currentUserId == null) throw Exception('User not authenticated');

    await _firestore.collection('questions').add({
      'title': title,
      'content': content,
      'questioner': currentUserId!,
      'createdAt': FieldValue.serverTimestamp(),
    });
  }

  // Get questions for current user (as questioner or assignee)
  Stream<List<Question>> getUserQuestions() {
    if (currentUserId == null) return Stream.value([]);

    return _firestore
        .collection('questions')
        .where(
          Filter.or(
            Filter('questioner', isEqualTo: currentUserId),
            Filter('assignee', isEqualTo: currentUserId),
          ),
        )
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map(
          (snapshot) =>
              snapshot.docs.map((doc) => Question.fromFirestore(doc)).toList(),
        );
  }

  // Get a specific question
  Stream<Question?> getQuestion(String questionId) {
    return _firestore
        .collection('questions')
        .doc(questionId)
        .snapshots()
        .map((doc) => doc.exists ? Question.fromFirestore(doc) : null);
  }

  // Update question (title and content) - only by questioner
  Future<void> updateQuestion({
    required String questionId,
    required String title,
    required String content,
  }) async {
    await _firestore.collection('questions').doc(questionId).update({
      'title': title,
      'content': content,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  // Add or update answer - only by assignee
  Future<void> updateAnswer({
    required String questionId,
    required String answer,
  }) async {
    await _firestore.collection('questions').doc(questionId).update({
      'answer': answer,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  // Delete question - only by questioner
  Future<void> deleteQuestion(String questionId) async {
    await _firestore.collection('questions').doc(questionId).delete();
  }

  // Assign an answerer to a question
  Future<void> assignAnswerer({
    required String questionId,
    required String assigneeId,
  }) async {
    await _firestore.collection('questions').doc(questionId).update({
      'assignee': assigneeId,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }
}

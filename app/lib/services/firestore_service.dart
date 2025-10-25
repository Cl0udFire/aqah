import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/question.dart';

class FirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  String? get currentUserId => _auth.currentUser?.uid;

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
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

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

  Stream<Question?> getQuestion(String questionId) {
    return _firestore
        .collection('questions')
        .doc(questionId)
        .snapshots()
        .map((doc) => doc.exists ? Question.fromFirestore(doc) : null);
  }

  Future<void> updateQuestion({
    required String questionId,
    required String title,
    required String content,
  }) async {
    await _firestore.collection('questions').doc(questionId).update({
      'title': title,
      'content': content,
      'updatedAt': DateTime.timestamp(),
    });
  }

  Future<void> addAnswer({
    required String questionId,
    required String content,
    required String sender,
  }) async {
    if (currentUserId == null) throw Exception('User not authenticated');

    await _firestore.collection('questions').doc(questionId).update({
      'answers': FieldValue.arrayUnion([
        {
          'content': content,
          'sender': sender,
          'timestamp': DateTime.timestamp(),
        },
      ]),
      'updatedAt': DateTime.timestamp(),
    });
  }

  Future<void> deleteQuestion(String questionId) async {
    await _firestore.collection('questions').doc(questionId).delete();
  }
}

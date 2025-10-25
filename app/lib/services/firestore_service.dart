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
      'completed': false,
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
          (snapshot) {
            final questions = snapshot.docs
                .map((doc) => Question.fromFirestore(doc))
                .toList();
            
            // Sort: incomplete questions first, then completed questions
            questions.sort((a, b) {
              if (a.completed == b.completed) {
                return b.createdAt.compareTo(a.createdAt);
              }
              return a.completed ? 1 : -1;
            });
            
            return questions;
          },
        );
  }

  Stream<List<Question>> getAllQuestions() {
    return _firestore
        .collection('questions')
        .where('completed', isEqualTo: true)
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

  Future<void> updateAnswer({
    required String questionId,
    required int answerIndex,
    required String newContent,
  }) async {
    if (currentUserId == null) throw Exception('User not authenticated');

    // Get the current question to update the specific answer
    final docSnapshot = await _firestore.collection('questions').doc(questionId).get();
    if (!docSnapshot.exists) throw Exception('Question not found');

    final data = docSnapshot.data() as Map<String, dynamic>;
    final answers = List<Map<String, dynamic>>.from(data['answers'] ?? []);

    if (answerIndex >= 0 && answerIndex < answers.length) {
      answers[answerIndex]['content'] = newContent;
      
      await _firestore.collection('questions').doc(questionId).update({
        'answers': answers,
        'updatedAt': DateTime.timestamp(),
      });
    } else {
      throw Exception('Invalid answer index');
    }
  }

  Future<void> deleteAnswer({
    required String questionId,
    required int answerIndex,
  }) async {
    if (currentUserId == null) throw Exception('User not authenticated');

    // Get the current question to delete the specific answer
    final docSnapshot = await _firestore.collection('questions').doc(questionId).get();
    if (!docSnapshot.exists) throw Exception('Question not found');

    final data = docSnapshot.data() as Map<String, dynamic>;
    final answers = List<Map<String, dynamic>>.from(data['answers'] ?? []);

    if (answerIndex >= 0 && answerIndex < answers.length) {
      answers.removeAt(answerIndex);
      
      await _firestore.collection('questions').doc(questionId).update({
        'answers': answers,
        'updatedAt': DateTime.timestamp(),
      });
    } else {
      throw Exception('Invalid answer index');
    }
  }

  Future<void> toggleCompleted(String questionId, bool completed) async {
    if (currentUserId == null) throw Exception('User not authenticated');

    await _firestore.collection('questions').doc(questionId).update({
      'completed': completed,
      'updatedAt': DateTime.timestamp(),
    });
  }

  Future<void> deleteQuestion(String questionId) async {
    await _firestore.collection('questions').doc(questionId).delete();
  }

  Future<void> acceptQuestion(String questionId) async {
    if (currentUserId == null) throw Exception('User not authenticated');

    await _firestore.collection('questions').doc(questionId).update({
      'acceptedByAssignee': true,
      'updatedAt': DateTime.timestamp(),
    });
  }

  Future<void> declineQuestion(String questionId) async {
    if (currentUserId == null) throw Exception('User not authenticated');

    await _firestore.collection('questions').doc(questionId).update({
      'declinedBy': FieldValue.arrayUnion([currentUserId!]),
      'assignee': FieldValue.delete(),
      'acceptedByAssignee': FieldValue.delete(),
      'updatedAt': DateTime.timestamp(),
    });
  }
}

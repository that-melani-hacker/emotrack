import 'package:flutter/material.dart';
import '../theme.dart';

class ResultScreen extends StatelessWidget {
  final Map<String, dynamic> data;
  const ResultScreen({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final emotion    = data['emotion']      ?? 'neutral';
    final emoji      = data['emoji']        ?? kEmojis[emotion] ?? '😐';
    final confidence = ((data['confidence'] ?? 0.0) * 100).toStringAsFixed(1);
    final stress     = data['stress_level'] ?? 'Low';
    final tip        = data['wellness_tip'] ?? '';
    final allScores  = Map<String, dynamic>.from(data['all_scores'] ?? {});
    final stressColor     = kStressColors[stress]     ?? kIceCard;
    final stressTextColor = kStressTextColors[stress] ?? kTextMuted;

    final sortedScores = allScores.entries.toList()
      ..sort((a, b) => (b.value as num).compareTo(a.value as num));

    return Scaffold(
      body: Column(children: [
        Container(
          color: kNavy,
          padding: EdgeInsets.only(
            top: MediaQuery.of(context).padding.top + 12,
            left: 8, right: 20, bottom: 20,
          ),
          child: Row(children: [
            IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white),
              onPressed: () => Navigator.pop(context),
            ),
            const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Emotion detected',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500,
                    color: Color(0xFFE8F0F8))),
              SizedBox(height: 2),
              Text('Based on your input',
                style: TextStyle(fontSize: 12, color: Color(0xFF7AA3C8))),
            ]),
          ]),
        ),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(children: [
              _card(child: Column(children: [
                const SizedBox(height: 8),
                Text(emoji, style: const TextStyle(fontSize: 48)),
                const SizedBox(height: 8),
                Text(emotion[0].toUpperCase() + emotion.substring(1),
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w500, color: kTextMain)),
                const SizedBox(height: 4),
                Text('$confidence% confident',
                  style: const TextStyle(fontSize: 13, color: kTextMuted)),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                  decoration: BoxDecoration(
                    color: stressColor, borderRadius: BorderRadius.circular(8)),
                  child: Text('$stress stress',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500,
                        color: stressTextColor)),
                ),
                const SizedBox(height: 16),
                const Divider(color: kBorder, height: 1),
                const SizedBox(height: 12),
                Align(alignment: Alignment.centerLeft,
                  child: const Text('All emotion scores',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: kTextMain))),
                const SizedBox(height: 10),
                ...sortedScores.map((e) => _ScoreBar(
                  label: e.key, score: (e.value as num).toDouble(),
                  isTop: e.key == emotion)),
              ])),
              const SizedBox(height: 12),
              _card(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Wellness tip',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: kTextMain)),
                const SizedBox(height: 8),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: kIceCard,
                    borderRadius: BorderRadius.circular(8),
                    border: const Border(left: BorderSide(color: kNavy, width: 3)),
                  ),
                  child: Text(tip,
                    style: const TextStyle(fontSize: 12, color: Color(0xFF2A5A8C), height: 1.6)),
                ),
              ])),
              const SizedBox(height: 12),
              ElevatedButton.icon(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Analyse another'),
              ),
              const SizedBox(height: 8),
              OutlinedButton.icon(
                onPressed: () => Navigator.pushNamed(context, '/history'),
                icon: const Icon(Icons.history, size: 18),
                label: const Text('View history'),
              ),
            ]),
          ),
        ),
      ]),
    );
  }

  Widget _card({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder, width: 0.5),
      ),
      child: child,
    );
  }
}

class _ScoreBar extends StatelessWidget {
  final String label;
  final double score;
  final bool isTop;
  const _ScoreBar({required this.label, required this.score, required this.isTop});

  @override
  Widget build(BuildContext context) {
    final emoji = kEmojis[label] ?? '😐';
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(children: [
        Text(emoji, style: const TextStyle(fontSize: 14)),
        const SizedBox(width: 4),
        SizedBox(width: 64,
          child: Text(label[0].toUpperCase() + label.substring(1),
            style: TextStyle(fontSize: 11, color: kTextMuted,
                fontWeight: isTop ? FontWeight.w500 : FontWeight.normal))),
        Expanded(child: ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: score,
            minHeight: 8,
            backgroundColor: kIceCard,
            valueColor: AlwaysStoppedAnimation(isTop ? kNavy : kBorder),
          ),
        )),
        const SizedBox(width: 8),
        SizedBox(width: 36,
          child: Text('${(score * 100).toStringAsFixed(0)}%',
            style: const TextStyle(fontSize: 11, color: kTextMuted),
            textAlign: TextAlign.right)),
      ]),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:fl_chart/fl_chart.dart';
import '../theme.dart';
import '../services/api_service.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});
  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  int? _userId;
  Map<String, int> _emotionCounts = {};
  List<dynamic> _history = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    _userId = prefs.getInt('user_id');
    if (_userId == null) { setState(() => _loading = false); return; }
    try {
      final hist  = await ApiService.history(_userId!);
      final stats = await ApiService.stats(_userId!);
      final counts = Map<String, dynamic>.from(stats['emotion_counts'] ?? {});
      setState(() {
        _history      = hist['history'] ?? [];
        _emotionCounts = counts.map((k, v) => MapEntry(k, (v as num).toInt()));
        _loading = false;
      });
    } catch (_) { setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(children: [
        Container(
          color: kNavy,
          padding: EdgeInsets.only(
            top: MediaQuery.of(context).padding.top + 12,
            left: 8, right: 20, bottom: 20,
          ),
          child: Row(children: [
            IconButton(icon: const Icon(Icons.arrow_back, color: Colors.white),
              onPressed: () => Navigator.pop(context)),
            const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Mood history',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500,
                    color: Color(0xFFE8F0F8))),
              SizedBox(height: 2),
              Text('Your emotion journal',
                style: TextStyle(fontSize: 12, color: Color(0xFF7AA3C8))),
            ]),
          ]),
        ),
        Expanded(child: _loading
          ? const Center(child: CircularProgressIndicator(color: kNavy))
          : _history.isEmpty
            ? _buildEmpty()
            : _buildContent()),
      ]),
    );
  }

  Widget _buildEmpty() {
    return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
      const Text('😐', style: TextStyle(fontSize: 40)),
      const SizedBox(height: 12),
      const Text('No entries yet',
        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: kTextMain)),
      const SizedBox(height: 6),
      const Text('Start by analysing your first emotion',
        style: TextStyle(fontSize: 13, color: kTextMuted)),
      const SizedBox(height: 20),
      ElevatedButton(
        onPressed: () => Navigator.pop(context),
        style: ElevatedButton.styleFrom(minimumSize: const Size(160, 44)),
        child: const Text('Go to home'),
      ),
    ]));
  }

  Widget _buildContent() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (_emotionCounts.isNotEmpty) ...[
          _card(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Emotion frequency',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: kTextMain)),
            const SizedBox(height: 16),
            SizedBox(height: 160, child: _buildChart()),
          ])),
          const SizedBox(height: 16),
        ],
        const Text('All entries',
          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: kTextMain)),
        const SizedBox(height: 8),
        ..._history.map((item) => Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: _card(child: _buildHistoryItem(item)),
        )),
      ],
    );
  }

  Widget _buildChart() {
    final sorted = _emotionCounts.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    final maxVal = sorted.isEmpty ? 1 : sorted.first.value.toDouble();

    return BarChart(BarChartData(
      alignment: BarChartAlignment.spaceAround,
      maxY: maxVal + 1,
      barTouchData: BarTouchData(enabled: false),
      titlesData: FlTitlesData(
        show: true,
        bottomTitles: AxisTitles(sideTitles: SideTitles(
          showTitles: true, reservedSize: 24,
          getTitlesWidget: (val, _) {
            if (val.toInt() >= sorted.length) return const SizedBox();
            final emoji = kEmojis[sorted[val.toInt()].key] ?? '';
            return Text(emoji, style: const TextStyle(fontSize: 14));
          },
        )),
        leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        topTitles:  const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        rightTitles:const AxisTitles(sideTitles: SideTitles(showTitles: false)),
      ),
      borderData: FlBorderData(show: false),
      gridData:   FlGridData(show: false),
      barGroups: sorted.asMap().entries.map((e) => BarChartGroupData(
        x: e.key,
        barRods: [BarChartRodData(
          toY: e.value.value.toDouble(),
          color: e.key == 0 ? kNavy : kBorder,
          width: 20, borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
        )],
      )).toList(),
    ));
  }

  Widget _buildHistoryItem(Map<String, dynamic> item) {
    final emotion         = item['emotion'] ?? 'neutral';
    final emoji           = kEmojis[emotion] ?? '😐';
    final stress          = item['stress_level'] ?? 'Low';
    final stressColor     = kStressColors[stress]     ?? kIceCard;
    final stressTextColor = kStressTextColors[stress] ?? kTextMuted;
    final ts              = (item['timestamp'] ?? '').toString();
    final displayDate     = ts.length >= 10 ? ts.substring(0, 10) : ts;

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Text(emoji, style: const TextStyle(fontSize: 22)),
        const SizedBox(width: 10),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Text(emotion[0].toUpperCase() + emotion.substring(1),
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: kTextMain)),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: stressColor, borderRadius: BorderRadius.circular(5)),
              child: Text(stress,
                style: TextStyle(fontSize: 9, fontWeight: FontWeight.w500, color: stressTextColor)),
            ),
          ]),
          const SizedBox(height: 2),
          Text(displayDate,
            style: const TextStyle(fontSize: 11, color: kTextHint)),
        ])),
      ]),
      const SizedBox(height: 8),
      Text((item['input_text'] ?? '').toString(),
        style: const TextStyle(fontSize: 12, color: kTextMuted, height: 1.4),
        maxLines: 2, overflow: TextOverflow.ellipsis),
      const SizedBox(height: 8),
      Container(
        width: double.infinity,
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: kIceCard, borderRadius: BorderRadius.circular(8),
          border: const Border(left: BorderSide(color: kNavy, width: 2.5)),
        ),
        child: Text(item['wellness_tip'] ?? '',
          style: const TextStyle(fontSize: 11, color: Color(0xFF2A5A8C), height: 1.5)),
      ),
    ]);
  }

  Widget _card({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder, width: 0.5),
      ),
      child: child,
    );
  }
}

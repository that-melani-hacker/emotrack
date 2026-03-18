import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../theme.dart';
import '../services/api_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _textCtrl = TextEditingController();
  bool _loading   = false;
  String? _error;
  int? _userId;
  String _userEmail = '';
  List<dynamic> _recent = [];
  int _tab = 0;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _userId    = prefs.getInt('user_id');
      _userEmail = prefs.getString('user_email') ?? '';
    });
    _loadRecent();
  }

  Future<void> _loadRecent() async {
    if (_userId == null) return;
    try {
      final res = await ApiService.history(_userId!);
      if (res.containsKey('history')) {
        setState(() => _recent = (res['history'] as List).take(3).toList());
      }
    } catch (_) {}
  }

  Future<void> _analyse() async {
    final text = _textCtrl.text.trim();
    if (text.isEmpty) {
      setState(() => _error = 'Please describe how you are feeling');
      return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      final res = await ApiService.predict(text, _userId);
      if (!mounted) return;
      if (res.containsKey('emotion')) {
        Navigator.pushNamed(context, '/result', arguments: res).then((_) {
          _textCtrl.clear();
          _loadRecent();
        });
      } else {
        setState(() => _error = res['error'] ?? 'Prediction failed');
      }
    } catch (e) {
      setState(() => _error = 'Cannot reach server. Is it running?');
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    if (!mounted) return;
    Navigator.pushReplacementNamed(context, '/login');
  }

  @override
  void dispose() { _textCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(children: [
        _buildHeader(),
        Expanded(
          child: IndexedStack(index: _tab, children: [
            _buildHomeTab(),
            _buildHistoryTab(),
          ]),
        ),
        _buildNavBar(),
      ]),
    );
  }

  Widget _buildHeader() {
    return Container(
      color: kNavy,
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 12,
        left: 20, right: 20, bottom: 20,
      ),
      child: Row(children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('EmoTrack',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w500,
                color: Color(0xFFE8F0F8), letterSpacing: 0.5)),
          const SizedBox(height: 2),
          Text(_tab == 0 ? 'How are you feeling today?' : 'Your mood history',
            style: TextStyle(fontSize: 12, color: kBlueGrey)),
        ])),
        PopupMenuButton<String>(
          icon: const Icon(Icons.more_vert, color: Colors.white),
          onSelected: (v) { if (v == 'logout') _logout(); },
          itemBuilder: (_) => [
            PopupMenuItem(value: 'logout',
              child: Row(children: const [
                Icon(Icons.logout, size: 16, color: kTextMuted),
                SizedBox(width: 8),
                Text('Sign out', style: TextStyle(fontSize: 13)),
              ])),
          ],
        ),
      ]),
    );
  }

  Widget _buildHomeTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        _Card(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Describe your feelings',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: kTextMain)),
          const SizedBox(height: 10),
          TextField(
            controller: _textCtrl,
            maxLines: 4,
            decoration: const InputDecoration(
              hintText: 'e.g. I have been feeling really anxious about my exam and cannot stop overthinking...',
              alignLabelWithHint: true,
            ),
          ),
          if (_error != null) ...[
            const SizedBox(height: 8),
            Text(_error!, style: const TextStyle(fontSize: 11, color: Color(0xFFA32D2D))),
          ],
          const SizedBox(height: 12),
          _loading
            ? const Center(child: Padding(
                padding: EdgeInsets.symmetric(vertical: 8),
                child: CircularProgressIndicator(color: kNavy)))
            : ElevatedButton.icon(
                onPressed: _analyse,
                icon: const Icon(Icons.psychology, size: 18),
                label: const Text('Analyse emotion'),
              ),
        ])),
        if (_recent.isNotEmpty) ...[
          const SizedBox(height: 16),
          const Text('Recent entries',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: kTextMain)),
          const SizedBox(height: 8),
          _Card(child: Column(
            children: _recent.asMap().entries.map((e) {
              final item = e.value;
              final isLast = e.key == _recent.length - 1;
              return _HistoryRow(item: item, showDivider: !isLast);
            }).toList(),
          )),
        ],
      ]),
    );
  }

  Widget _buildHistoryTab() {
    return FutureBuilder<Map<String, dynamic>>(
      future: _userId != null ? ApiService.history(_userId!) : null,
      builder: (ctx, snap) {
        if (snap.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator(color: kNavy));
        }
        final items = snap.data?['history'] as List? ?? [];
        if (items.isEmpty) {
          return Center(
            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Text('😐', style: TextStyle(fontSize: 40)),
              const SizedBox(height: 12),
              const Text('No entries yet',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: kTextMain)),
              const SizedBox(height: 6),
              const Text('Start by analysing your first emotion',
                style: TextStyle(fontSize: 13, color: kTextMuted)),
            ]),
          );
        }
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: items.length,
          itemBuilder: (_, i) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: _Card(child: _HistoryRow(item: items[i], showDivider: false)),
          ),
        );
      },
    );
  }

  Widget _buildNavBar() {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: kBorder, width: 0.5)),
      ),
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).padding.bottom, top: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _NavItem(icon: Icons.home_outlined, label: 'Home',    active: _tab == 0, onTap: () => setState(() => _tab = 0)),
          _NavItem(icon: Icons.history,       label: 'History', active: _tab == 1, onTap: () => setState(() => _tab = 1)),
        ],
      ),
    );
  }
}

class _Card extends StatelessWidget {
  final Widget child;
  const _Card({required this.child});
  @override
  Widget build(BuildContext context) {
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

class _HistoryRow extends StatelessWidget {
  final Map<String, dynamic> item;
  final bool showDivider;
  const _HistoryRow({required this.item, required this.showDivider});

  @override
  Widget build(BuildContext context) {
    final emotion     = item['emotion'] ?? 'neutral';
    final stress      = item['stress_level'] ?? 'Low';
    final emoji       = kEmojis[emotion] ?? '😐';
    final textPreview = (item['input_text'] ?? '').toString();
    final ts          = item['timestamp'] ?? '';
    final stressColor     = kStressColors[stress]     ?? kIceCard;
    final stressTextColor = kStressTextColors[stress] ?? kTextMuted;

    return Column(children: [
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
          Text(textPreview,
            style: const TextStyle(fontSize: 11, color: kTextMuted),
            maxLines: 1, overflow: TextOverflow.ellipsis),
        ])),
        const SizedBox(width: 8),
        Text(ts.length > 10 ? ts.substring(0, 10) : ts,
          style: const TextStyle(fontSize: 10, color: kTextHint)),
      ]),
      if (showDivider) ...[
        const SizedBox(height: 8),
        const Divider(height: 1, color: kBorder),
        const SizedBox(height: 8),
      ],
    ]);
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback onTap;
  const _NavItem({required this.icon, required this.label, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, color: active ? kNavy : kTextHint, size: 22),
        const SizedBox(height: 2),
        Text(label, style: TextStyle(
          fontSize: 10, color: active ? kNavy : kTextHint,
          fontWeight: active ? FontWeight.w500 : FontWeight.normal)),
      ]),
    );
  }
}

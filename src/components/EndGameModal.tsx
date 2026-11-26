import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  X, 
  RotateCcw, 
  Eye,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Clock
} from 'lucide-react';
import { useGame } from '../context/GameContext';

export const EndGameModal: React.FC = () => {
  const { 
    activeModal,
    closeModal, 
    players, 
    territories, 
    economyConfig, 
    resetGame 
  } = useGame();

  const isTimeUp = activeModal === 'GAME_TIME_UP';
  const [view, setView] = useState<'confirm' | 'standings'>(isTimeUp ? 'standings' : 'confirm');

  useEffect(() => {
    if (activeModal === 'GAME_TIME_UP') {
      setView('standings');
    } else if (activeModal === 'END_GAME') {
      setView('confirm');
    }
  }, [activeModal]);

  if (activeModal !== 'END_GAME' && activeModal !== 'GAME_TIME_UP') return null;

  // Calculate scores for all players
  const playerScores = players.map(player => {
    const ownedTerrs = territories.filter(t => t.ownerId === player.id);
    const territoryVP = ownedTerrs.reduce((sum, t) => {
      const cfg = economyConfig[t.category];
      const bonusVP = (t.activeBonuses || []).reduce((bSum, b) => bSum + (b.pointBonus || 0), 0);
      return sum + (cfg ? cfg.basePoints : t.basePoints) + bonusVP;
    }, 0);

    const bonusCardVP = player.victoryPoints; // contains mission, opportunity, crisis VP changes
    const totalVP = territoryVP + bonusCardVP;

    return {
      player,
      territoryCount: ownedTerrs.length,
      territoryVP,
      bonusCardVP,
      totalVP,
      budget: player.budget,
    };
  });

  // Sort descending by totalVP
  playerScores.sort((a, b) => b.totalVP - a.totalVP);

  const highestScore = playerScores[0]?.totalVP ?? 0;
  const winners = playerScores.filter(p => p.totalVP === highestScore);
  const isTie = winners.length > 1;

  const handleConfirmEndGame = () => {
    resetGame();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#253451]/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white border-2 border-[#EAE9E3] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        <button
          onClick={closeModal}
          className="absolute top-5 right-5 text-[#253451]/40 hover:text-[#253451] p-2 rounded-xl hover:bg-[#F8F5EC] transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {view === 'confirm' && !isTimeUp ? (
          /* Step 1: Confirmation View with Explicit Warning */
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-red-100 border-2 border-red-200 flex items-center justify-center text-red-600 shadow-sm animate-pulse">
              <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
            </div>

            <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full inline-block">
              Konfirmasi Akhiri Permainan
            </span>

            <h2 className="text-2xl font-display font-black text-[#253451] uppercase tracking-wide">
              Apakah Anda Yakin Ingin Mengakhiri Pertandingan?
            </h2>

            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-left text-xs text-[#253451] space-y-2">
              <div className="font-black text-amber-900 flex items-center gap-1.5 uppercase tracking-wide">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Peringatan Penghapusan Data Sesi:</span>
              </div>
              <p className="text-amber-950/80 leading-relaxed font-medium">
                Mengakhiri pertandingan akan menghentikan timer ekonomi dan menghapus seluruh progres gameplay sesi ini secara permanen:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-amber-900/90 font-mono text-[11px]">
                <li>Data pemain & warna pion yang sedang bertanding</li>
                <li>Saldo Government Budget (GB) dan Victory Points (VP)</li>
                <li>Status kepemilikan 40 wilayah di atas peta</li>
                <li>Status kartu Policy, Krisis, Misi, dan Peluang yang telah digunakan</li>
                <li>Seluruh riwayat transaksi & Game History sesi ini</li>
              </ul>
              <p className="text-[11px] text-emerald-800 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                ✓ Aset statis peta asli, logo wilayah, gambar kartu fisik, dan aturan default tetap tersimpan aman.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 py-3.5 rounded-2xl bg-[#F8F5EC] hover:bg-[#EAE9E3] text-[#253451] font-display font-bold text-xs uppercase tracking-wider border border-[#EAE9E3] transition flex items-center justify-center gap-2"
              >
                <span>Batal (Lanjutkan Main)</span>
              </button>

              <button
                type="button"
                onClick={() => setView('standings')}
                className="flex-1 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-display font-bold text-xs uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                <span>Lihat Skor Akhir Dahulu</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmEndGame}
                className="flex-1 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-display font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Konfirmasi Akhiri Game</span>
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Final Standings & Winner Announcement */
          <div className="text-center">
            {/* Victory Trophy / Time-up icon */}
            <div className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center shadow-lg border-2 mb-3 animate-bounce ${
              isTimeUp
                ? 'bg-red-100 border-red-200 text-red-600'
                : 'bg-gradient-to-tr from-[#F4CE70] via-amber-300 to-yellow-200 border-amber-200 text-amber-900'
            }`}>
              {isTimeUp ? <Clock className="w-8 h-8 stroke-[2.5]" /> : <Trophy className="w-8 h-8 stroke-[2.5]" />}
            </div>

            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block border ${
              isTimeUp
                ? 'text-red-700 bg-red-50 border-red-200'
                : 'text-amber-700 bg-amber-50 border-amber-200/60'
            }`}>
              {isTimeUp ? 'Match Timer Habis — Pertandingan Selesai' : 'Peringkat Akhir Pertandingan'}
            </span>
            <h2 className="text-2xl font-display font-black text-[#253451] tracking-tight mt-1.5 uppercase">
              {isTie ? 'Diplomatic Stalemate (TIE)' : `🏆 ${winners[0]?.player.name} Keluar Sebagai Pemenang!`}
            </h2>
            <p className="text-xs text-[#253451]/70 max-w-md mx-auto mt-1 leading-relaxed">
              {isTimeUp
                ? `Waktu pertandingan telah mencapai 00:00. ${isTie
                    ? `Beberapa pemain meraih total poin tertinggi yang sama sebesar ${highestScore} VP!`
                    : `${winners[0]?.player.name} memenangkan pertandingan dengan total ${highestScore} Victory Points!`} Seluruh data sesi tetap tersimpan dan tidak dihapus otomatis.`
                : isTie
                  ? `Beberapa pemain meraih total poin tertinggi yang sama sebesar ${highestScore} VP!`
                  : `Melalui tata kelola wilayah dan strategi kebijakan yang unggul, ${winners[0]?.player.name} memenangkan pertandingan dengan total ${highestScore} Victory Points!`}
            </p>

            {/* Leaderboard Standings Table */}
            <div className="mt-5 mb-6 bg-white rounded-2xl border border-[#EAE9E3] overflow-hidden shadow-xs">
              <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-[#F8F5EC] border-b border-[#EAE9E3] text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/60 text-left">
                <div className="col-span-1 text-center">Rank</div>
                <div className="col-span-4">Pemain</div>
                <div className="col-span-2 text-center">Wilayah</div>
                <div className="col-span-2 text-center">Bonus Kartu</div>
                <div className="col-span-3 text-right">Total VP</div>
              </div>

              <div className="divide-y divide-[#EAE9E3]">
                {playerScores.map((item, idx) => {
                  const playerBg =
                    item.player.color === 'red' ? 'bg-[#EF4444]' :
                    item.player.color === 'blue' ? 'bg-[#3B82F6]' :
                    item.player.color === 'green' ? 'bg-[#10B981]' : 'bg-[#F59E0B]';

                  return (
                    <div 
                      key={item.player.id}
                      className={`grid grid-cols-12 gap-2 px-4 py-3 items-center text-left text-xs transition ${
                        idx === 0 ? 'bg-amber-50/70' : 'hover:bg-[#F8F5EC]'
                      }`}
                    >
                      <div className="col-span-1 text-center font-bold font-mono">
                        {idx === 0 ? (
                          <span className="text-lg">🥇</span>
                        ) : idx === 1 ? (
                          <span className="text-lg">🥈</span>
                        ) : idx === 2 ? (
                          <span className="text-lg">🥉</span>
                        ) : (
                          <span className="text-[#253451]/40 font-bold">#4</span>
                        )}
                      </div>

                      <div className="col-span-4 flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${playerBg} ring-2 ring-white shadow-xs shrink-0`} />
                        <div className="truncate font-display font-bold text-[#253451]">
                          {item.player.name}
                          <div className="text-[10px] text-[#253451]/50 font-mono font-normal">
                            Saldo: {item.budget} GB
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2 text-center font-mono font-semibold text-[#253451]">
                        {item.territoryCount}{' '}
                        <span className="text-[10px] text-[#253451]/50 font-normal">({item.territoryVP} VP)</span>
                      </div>

                      <div className="col-span-2 text-center font-mono font-bold">
                        <span className={item.bonusCardVP >= 0 ? 'text-[#2e6d34]' : 'text-red-500'}>
                          {item.bonusCardVP >= 0 ? `+${item.bonusCardVP}` : item.bonusCardVP} VP
                        </span>
                      </div>

                      <div className="col-span-3 text-right font-mono font-black text-sm text-[#253451]">
                        {item.totalVP} <span className="text-[10px] font-normal text-[#253451]/50">VP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 py-3 rounded-2xl bg-[#F8F5EC] hover:bg-[#EAE9E3] text-[#253451] font-display font-bold text-xs uppercase tracking-wider border border-[#EAE9E3] transition flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4 text-[#253451]/60" />
                <span>{isTimeUp ? 'Tutup & Tinjau Peta' : 'Tinjau Peta Permainan'}</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmEndGame}
                className={`flex-1 py-3 rounded-2xl text-white font-display font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 ${
                  isTimeUp
                    ? 'bg-slate-600 hover:bg-slate-700'
                    : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
                }`}
                title={isTimeUp ? 'Hanya jika Anda memang ingin menghapus sesi dan memulai ulang' : undefined}
              >
                <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                <span>{isTimeUp ? 'Reset Manual (Hapus Sesi)' : 'Reset Sesi & Game Baru'}</span>
              </button>
            </div>

            {isTimeUp && (
              <p className="mt-3 text-[10px] font-bold text-[#253451]/50 uppercase tracking-wide">
                Notifikasi waktu habis tidak menghapus atau mereset permainan secara otomatis.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

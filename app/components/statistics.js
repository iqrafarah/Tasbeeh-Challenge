import Image from "next/image";

export default function Statistics(stats) {
    const userData = stats.stats;
    return (
        <div className="mt-5">
            <h3 className="small_title">Statistics</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="flex gap-3 bg-[#c4f8c3] rounded-xl p-4">
                    <div
                        className="w-[40px] h-[40px] flex items-center justify-center rounded-lg bg-[#94D098] overflow-hidden">
                        <i className="fas fa-bullseye text-lg"></i>
                    </div>
                    <div className="flex flex-col">
                        <span className="title">{userData.ChallengesCompleted}</span>
                        <span className="text-xs">Challenges</span>
                    </div>
                </div>
                <div className="flex gap-3 bg-[#d8d8f2] rounded-xl p-4">
                    <div
                        className="w-[40px] h-[40px] flex items-center justify-center rounded-lg bg-[#949CD0] overflow-hidden">
                        <i className="fas fa-praying-hands text-lg"></i>
                    </div>
                    <div className="flex flex-col">
                        <span className="title">{userData.totalDhikr}</span>
                        <span className="text-xs">Total Dhikr</span>
                    </div>
                </div>
                <div className="flex gap-3 bg-[#f2c4e3] rounded-xl p-4">
                    <div
                        className="w-[40px] h-[40px] flex items-center justify-center rounded-lg bg-[#D094BA] overflow-hidden">
                        <i className="fa-solid fa-fire-flame-curved text-lg"></i>
                    </div>
                    <div className="flex flex-col">
                        <span className="title">{userData.longestStreak}</span>
                        <span className="text-xs">Best Streak</span>
                    </div>
                </div>

                <div className="flex gap-3 bg-[#f2e8c4] rounded-xl p-4">
                    <div
                        className="w-[40px] h-[40px] flex items-center justify-center rounded-lg bg-[#d0c694] overflow-hidden">
                        <i className="fas fa-coins text-lg"></i>
                    </div>
                    <div className="flex flex-col">
                        <span className="title">{userData.totalPoints}</span>
                        <span className="text-xs">Total Points</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
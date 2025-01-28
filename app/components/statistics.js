import Image from "next/image";

export default function Statistics() {
    return (
        <div className="mt-5">
            <h3 className="title">Statistics</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="flex gap-3 bg-[#c4f8c3] rounded-xl p-4">
                    <div className="w-[40px] h-[40px] flex items-center justify-center rounded-lg bg-[#94D098] overflow-hidden">
                        <Image src="/challengeIcon.png" width={20} height={20} alt="" className="object-cover" />
                    </div>
                    <div className="flex flex-col">
                        <span className="title">304</span>
                        <span className="text-sm">Challenges</span>
                    </div>
                </div>
                <div className="flex gap-3 bg-[#d8d8f2] rounded-xl p-4">
                    <div className="w-[40px] h-[40px] flex items-center justify-center rounded-lg bg-[#949CD0] overflow-hidden">
                        <Image src="/dhikrIcon.png" width={20} height={20} alt="" className="object-cover" />
                    </div>
                    <div className="flex flex-col">
                        <span className="title">24.5k</span>
                        <span className="text-sm">Dhikr</span>
                    </div>
                </div>
                <div className="flex gap-3 bg-[#f2c4e3] rounded-xl p-4">
                    <div className="w-[40px] h-[40px] flex items-center justify-center rounded-lg bg-[#D094BA] overflow-hidden">
                        <Image src="/pointsIcon.png" width={20} height={20} alt="" className="object-cover" />
                    </div>
                    <div className="flex flex-col">
                        <span className="title">1000</span>
                        <span className="text-sm">Points</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
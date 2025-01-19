import Image from "next/image";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white z-50  text-center flex flex-col items-center justify-center h-screen gap-3">
      <Image
        src="/icon.png"
        alt="icon"
        width={100}
        height={100}
        className="w-[60px] h-[60px] object-cover rounded-lg"
      />
      <h1 className="title">Tasbeeh Challenge</h1>
    </div>
  );
}

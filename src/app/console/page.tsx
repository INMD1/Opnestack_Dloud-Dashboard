"use client";
import {
  Card,
} from "@/components/ui/card"
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

//Icons
import { VscVm } from "react-icons/vsc";
import { PiNetwork } from "react-icons/pi";
import { GrStorage } from "react-icons/gr";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    setMessage(welcomeMessages[randomIndex]);
  }, []);

  useEffect(() => {
    async function fetchData() {
      const data = await fetch("/api/v1/limits");
      console.log(await data.json()); // {ok: true}
    }

    fetchData();
  }, []);


  const welcomeMessages = [
    "환영합니다! 새로운 시작을 함께해요 🚀",
    "어서 오세요! 기다리고 있었어요 👋",
    "환영해요! 즐거운 시간 보내세요 🎉",
    "함께해서 기뻐요! 좋은 하루 되세요 🌟",
    "환영합니다! 오늘도 화이팅입니다 💪",
    "오신 걸 진심으로 환영합니다 🙌",
    "어서 오세요! 즐겁게 놀다 가세요 😄",
    "환영합니다! 새로운 인연을 기대해요 💫",
    "환영해요! 여기서 좋은 추억 만드세요 📖",
    "어서 오세요! 따뜻하게 맞이합니다 🔥",
    "환영합니다! 특별한 하루 되세요 🌈",
    "반가워요! 즐거운 시간을 보내세요 🥳",
    "어서 오세요! 새로운 모험이 기다리고 있어요 ⚔️",
    "환영합니다! 함께 성장해요 🌱",
    "환영해요! 이곳에서 행복하시길 바랍니다 💖",
    "어서 오세요! 차 한 잔 하고 가세요 ☕",
    "환영합니다! 멋진 여정을 시작해요 🌍",
    "반가워요! 즐거운 경험이 되길 바래요 🎶",
    "어서 오세요! 오늘도 특별한 하루 되세요 ✨",
    "환영해요! 마음껏 즐겨주세요 🕹️",
    "환영합니다! 당신의 참여가 큰 힘이 됩니다 🌟",
    "어서 오세요! 편하게 쉬다 가세요 🛋️",
    "환영해요! 새로운 기회가 열리고 있어요 🔑",
    "환영합니다! 언제나 환영해요 💌",
    "어서 오세요! 지금 이 순간을 즐겨요 🎈",
    "환영합니다! 이곳은 언제나 열려있어요 🚪",
    "반가워요! 당신의 빛으로 환해져요 💡",
    "어서 오세요! 따뜻한 공간에 오신 걸 환영해요 🌸",
    "환영합니다! 함께라서 더 즐겁습니다 🤝",
    "환영해요! 당신이 있어 더 특별해요 🌹",
  ];

  return (

    <div className="grid gird-cols-1 px-10 sm:px-23 py-15">
      {/*환영 문구 표시 */}
      <div className="">
        <p className="font-bold text-3xl">{session?.user?.name}님!</p>
        <p className="text-2xl text-gray-600">{message}</p>
      </div>

      {/*현재 사용중인 인스턴스 (요약버전)*/}
      <div className="my-5">
        <p className="text-xl font-bold">현재 사용중인 인스턴스 (요약)</p>
      </div>
      <div className="flex gap-x-5">
        <Card className="px-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 p-4">
            {/* 아이콘 */}
            <VscVm className="text-5xl text-gray-700 flex-shrink-0" />
            <p className="text-xl font-bold">VM 가동수</p>
            <p className="text-xl">NA개</p>
          </div>
        </Card>
        <Card className="px-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 p-4">
            {/* 아이콘 */}
            <PiNetwork className="text-5xl text-gray-700 flex-shrink-0" />
            <p className="text-xl font-bold">포트포워딩 개수</p>
            <p className="text-xl">NA개</p>
          </div>
        </Card>
        <Card className="px-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 p-4">
            {/* 아이콘 */}
            <GrStorage className="text-5xl text-gray-700 flex-shrink-0" />
            <p className="text-xl font-bold pr-2">Disk 사용수/용량</p>
            <div className="gird">
              <p className="text-xl">NA개</p>
              <p className="text-xl">(0.00 GB)</p>
            </div>
          </div>
        </Card>
      </div>

      {/*현재 사용중인 인스턴스 (전채버전)*/}
      <div className="my-5">
        <p className="text-xl font-bold">현 계정 한도 요약 버전</p>
      </div>
    </div>

  );
}

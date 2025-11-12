import { Input } from "@/components/ui/input";

export default function instance_create() {
    return <>
        <div className="flex flex-row px-25">
            <div className="grid gap-y-6 *:basis-2/3">
                <div className="pt-30"></div>
                <p className="font-bold text-5xl">인스턴스 제작</p>
                <div>
                    <p className="font-bold text-xl pb-5">인스턴스 이름 입력</p>
                    <Input></Input>
                    <div className="text-sm">
                        <p className="pt-3">*인스턴스 이름은 한번 입력하면 변경이 불가합니다.</p>
                        <p className="">*인스턴스 이름으로 host이름이 정해짐니다.</p>
                        <p className="">*영어 대소문자 및 숫자로만 작성이 가능합니다.</p>
                    </div>
                </div>
                <hr />
                <div>
                    <p className="font-bold text-xl pb-5"> 인스턴스 성능 선택</p>
                    <div className="grid grid-row-2 grid-cols-3">
                        
                    
                    </div> 
                </div>
                <hr />
            </div>
            <div className="basis-1/3">

            </div>
        </div>
    </>
}
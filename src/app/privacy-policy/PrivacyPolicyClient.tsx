'use client'

import * as React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import {
    Command, CommandEmpty, CommandGroup,
    CommandItem, CommandList,
} from '@/components/ui/command'
import '../TermsofUse/markdown.css'

interface PrivacyPolicyClientProps {
    Getyears: { value: string; label: string }[]
}

export default function PrivacyPolicyClient({ Getyears }: PrivacyPolicyClientProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const yearFromUrl = searchParams.get('year') ?? '2025'

    const [value, setValue] = React.useState(yearFromUrl)
    const [content, setContent] = React.useState('')
    const [loading, setLoading] = React.useState(true)
    const [open, setOpen] = React.useState(false)

    React.useEffect(() => {
        const fetchContent = async () => {
            setLoading(true)
            const res = await fetch(`/api/markdown?type=privacy&year=${value}`)
            const data = await res.text()
            setContent(data)
            setLoading(false)
        }

        fetchContent()
    }, [value])

    return (
        <div>
            <div className="min-h-screen flex flex-col items-start p-20 bg-[#17171c]">
                <p className="text-3xl mb-6 text-white font-bold">개인정보 처리방침</p>

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[200px] justify-between">
                            {Getyears.find((y) => y.value === value)?.label ?? '년도 선택'}
                            <ChevronsUpDownIcon className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                        <Command>
                            <CommandList>
                                <CommandEmpty>No year found.</CommandEmpty>
                                <CommandGroup>
                                    {Getyears.map((item) => (
                                        <CommandItem
                                            key={item.value}
                                            value={item.value}
                                            onSelect={(currentValue) => {
                                                setValue(currentValue)
                                                setOpen(false)
                                                router.push(`?year=${currentValue}`)
                                            }}
                                        >
                                            <CheckIcon
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === item.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {item.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>


                <div className="prose mt-8 text-white">
                    {loading ? "불러오는 중..." : (
                        <div dangerouslySetInnerHTML={{ __html: content }} />
                    )}
                </div>
            </div>
        </div>
    )
}

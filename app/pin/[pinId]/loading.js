import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';


const PinDetailsLoading = () => {
    return (
        <div className='flex items-end w-full h-screen mt-72 sm:mt-0'>
            <div className='flex items-center justify-center w-full  h-[calc(100vh-80px)]'>
                <div className="container max-w-4xl p-4 mx-auto">
                    <div className="flex flex-col overflow-hidden bg-white rounded-lg shadow-lg md:flex-row md:space-x-8">
                        <div className="flex flex-col items-center md:w-1/2">
                            <Skeleton className="object-cover w-full min-h-[600px]" />
                        </div>

                        <div className="flex flex-col justify-between p-6 md:w-1/2">
                            <div>
                                <div className='flex items-center justify-between w-full mb-6'>
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="w-10 h-10 rounded-full" />
                                        <Skeleton className="w-8 h-8 rounded-full" />
                                    </div>
                                    <Skeleton className="px-6 py-3 rounded-3xl" />
                                </div>
                                <Skeleton className="mb-4 text-3xl font-bold" />
                                <Skeleton className="mb-5 text-lg" />

                                <div className='flex items-center justify-between mb-5'>
                                    <div className='flex items-center gap-2'>
                                        <Skeleton className='w-10 h-10 rounded-full' />
                                        <div>
                                            <Skeleton className='text-sm font-semibold' />
                                            <Skeleton className='text-sm' />
                                        </div>
                                    </div>
                                    <Skeleton className="px-3 py-3 rounded-full" />
                                </div>

                                <div className='mt-5'>
                                    <Skeleton className='font-medium' />
                                    <div className='flex flex-col mt-2 space-y-2 overflow-y-scroll max-h-[150px] scrollbar-hidden'>
                                        <Skeleton className='flex flex-col' />
                                        <Skeleton className='flex flex-col' />
                                    </div>
                                </div>
                            </div>

                            <hr className='mt-5' />
                            <div>
                                <div className='flex items-center justify-between w-full my-3'>
                                    <Skeleton className='text-sm' />
                                    <div className='flex items-center gap-2'>
                                        <Skeleton className='w-4 h-4' />
                                        <Skeleton className="px-3 py-3 rounded-full" />
                                    </div>
                                </div>

                                <div className='flex items-center gap-3 mt-2'>
                                    <Skeleton className='w-12 h-12 rounded-full' />
                                    <div className='flex items-center w-full p-1 border rounded-md'>
                                        <Skeleton className='w-full px-4 py-2' />
                                        <Skeleton className='flex items-center justify-center w-12 h-10 rounded-full' />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PinDetailsLoading;

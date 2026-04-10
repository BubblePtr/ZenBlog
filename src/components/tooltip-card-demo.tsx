'use client';
import { Tooltip } from '@/components/ui/tooltip-card';

export default function TooltipCardDemo() {
  return (
    <div className="mx-auto max-w-2xl p-4 md:p-10">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        There was a problem with the server. Once{' '}
        <Tooltip
          containerClassName="text-neutral-600 dark:text-neutral-400"
          content="AWS markets itself as the “world's most comprehensive and broadly adopted cloud platform” offering over 200 fully featured services globally."
        >
          <span className="font-bold">AWS</span>
        </Tooltip>{' '}
        went down, we had to quickly migrate to a new provider. AWS in general is a great service,
        but sometimes it&apos;s not available.
      </p>
      <p className="mt-10 text-sm text-neutral-600 dark:text-neutral-400">
        The server was administered by{' '}
        <Tooltip
          containerClassName="text-neutral-600 dark:text-neutral-400"
          content={<TooltipCard />}
        >
          {' '}
          <span className="cursor-pointer font-bold">Tyler Durden.</span>
        </Tooltip>{' '}
        Tyler has been with us for a long time. He is a great asset to the team and sometimes tries
        to act in different ways which can be difficult to manage.{' '}
      </p>

      <p className="mt-10 text-sm text-neutral-600 dark:text-neutral-400">
        That is when we approached Tyler for a cute little{' '}
        <Tooltip
          containerClassName="text-neutral-600 dark:text-neutral-400"
          content={<TestimonialCard />}
        >
          {' '}
          <span className="cursor-pointer font-bold">testimonial.</span>
        </Tooltip>{' '}
        Instead of a testimonial, he started yapping about project mayhem and how we should be using
        our skills to build a better future.
      </p>
    </div>
  );
}

const TooltipCard = () => {
  return (
    <div>
      <img
        src="https://assets.aceternity.com/screenshots/tyler.webp"
        alt="Tyler Durden"
        className="aspect-square w-full rounded-sm"
      />
      <div className="my-4 flex flex-col">
        <p className="text-lg font-bold">Tyler Durden</p>
        <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
          Soap Developer from a Tier 3 college. Enthusiastic and exhibits entrepreneurial spirit.
        </p>
      </div>
    </div>
  );
};

const TestimonialCard = () => {
  return (
    <div className="">
      <blockquote className="mb-4 text-neutral-700 dark:text-neutral-300">
        This product is absolutely, grade A horse shit.
      </blockquote>
      <div className="flex items-center gap-2">
        <img
          src="https://assets.aceternity.com/screenshots/tyler.webp"
          alt="Tyler Durden"
          className="size-6 rounded-full object-cover"
        />
        <div>
          <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
            Tyler Durden
          </p>
          <p className="text-[10px] text-neutral-600 dark:text-neutral-400">
            Senior Product Manager at FC
          </p>
        </div>
      </div>
    </div>
  );
};

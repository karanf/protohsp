'use client';
import { cn } from '@repo/ui/lib/utils';
import { motion, MotionValue, SpringOptions, useSpring, useTransform } from 'motion/react';
import { useEffect } from 'react';
import type { ElementType } from 'react';

export type AnimatedNumberProps = {
  value: number;
  className?: string;
  springOptions?: SpringOptions;
  as?: 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
};

export function AnimatedNumber({
  value,
  className,
  springOptions,
  as = 'span',
}: AnimatedNumberProps) {
  // Use predefined motion components instead of dynamic creation
  const Component = as === 'div' ? motion.div
    : as === 'p' ? motion.p
    : as === 'h1' ? motion.h1
    : as === 'h2' ? motion.h2
    : as === 'h3' ? motion.h3
    : as === 'h4' ? motion.h4
    : as === 'h5' ? motion.h5
    : as === 'h6' ? motion.h6
    : motion.span;

  const spring = useSpring(value, springOptions);
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <Component className={cn('tabular-nums', className)}>
      {display}
    </Component>
  );
}

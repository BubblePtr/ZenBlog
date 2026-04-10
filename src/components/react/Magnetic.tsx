import { useRef } from 'react';
import type { ReactNode, MouseEvent } from 'react';
import { motion, useSpring } from 'framer-motion';

interface MagneticProps {
  children: ReactNode;
  strength?: number; // 磁力强度，默认 0.2
}

export default function Magnetic({ children, strength = 0.2 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  // 使用弹簧动画，让回弹更具物理质感
  // stiffness: 刚度，越高回弹越快
  // damping: 阻尼，越低回弹越晃
  const x = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });
  const y = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: MouseEvent) => {
    const { clientX, clientY } = e;
    if (!ref.current) return;

    const { height, width, left, top } = ref.current.getBoundingClientRect();

    // 计算鼠标距离元素中心的偏移量
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);

    // 设置位移 (偏移量 * 强度)
    x.set(middleX * strength);
    y.set(middleY * strength);
  };

  const handleMouseLeave = () => {
    // 鼠标离开时归零
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      className="inline-block" // 保持内联块级布局，不破坏原有排版
    >
      {children}
    </motion.div>
  );
}

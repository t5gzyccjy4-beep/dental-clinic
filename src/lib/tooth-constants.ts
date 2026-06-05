// 牙位编号系统
// 内部存储使用 FDI 双位数编号 (11-48)，显示使用象限内编号 1-8
// 成人恒牙 (Permanent teeth): 32颗，每象限 1-8（1=中切牙, 8=智齿）
// 儿童乳牙 (Deciduous teeth): 20颗，每象限 1-5（1=中切牙, 5=第二乳磨牙）

export interface ToothInfo {
  number: string       // FDI编号（内部存储用）
  displayNumber: number // 显示编号：象限内编号 1-8
  name: string         // 中文名称
  quadrant: string     // 象限: UR(右上), UL(左上), LL(左下), LR(右下)
}

// 成人恒牙 - 每象限 1-8（1=中切牙, 8=智齿）
export const ADULT_TEETH: ToothInfo[] = [
  // 右上颌 (Upper Right) - 屏幕从左到右：8→1
  { number: '18', displayNumber: 8, name: '右上第三磨牙(智齿)', quadrant: 'UR' },
  { number: '17', displayNumber: 7, name: '右上第二磨牙', quadrant: 'UR' },
  { number: '16', displayNumber: 6, name: '右上第一磨牙', quadrant: 'UR' },
  { number: '15', displayNumber: 5, name: '右上第二前磨牙', quadrant: 'UR' },
  { number: '14', displayNumber: 4, name: '右上第一前磨牙', quadrant: 'UR' },
  { number: '13', displayNumber: 3, name: '右上尖牙', quadrant: 'UR' },
  { number: '12', displayNumber: 2, name: '右上侧切牙', quadrant: 'UR' },
  { number: '11', displayNumber: 1, name: '右上中切牙', quadrant: 'UR' },
  // 左上颌 (Upper Left) - 屏幕从左到右：1→8
  { number: '21', displayNumber: 1, name: '左上中切牙', quadrant: 'UL' },
  { number: '22', displayNumber: 2, name: '左上侧切牙', quadrant: 'UL' },
  { number: '23', displayNumber: 3, name: '左上尖牙', quadrant: 'UL' },
  { number: '24', displayNumber: 4, name: '左上第一前磨牙', quadrant: 'UL' },
  { number: '25', displayNumber: 5, name: '左上第二前磨牙', quadrant: 'UL' },
  { number: '26', displayNumber: 6, name: '左上第一磨牙', quadrant: 'UL' },
  { number: '27', displayNumber: 7, name: '左上第二磨牙', quadrant: 'UL' },
  { number: '28', displayNumber: 8, name: '左上第三磨牙(智齿)', quadrant: 'UL' },
  // 左下颌 (Lower Left) - 屏幕从左到右：1→8
  { number: '38', displayNumber: 8, name: '左下第三磨牙(智齿)', quadrant: 'LL' },
  { number: '37', displayNumber: 7, name: '左下第二磨牙', quadrant: 'LL' },
  { number: '36', displayNumber: 6, name: '左下第一磨牙', quadrant: 'LL' },
  { number: '35', displayNumber: 5, name: '左下第二前磨牙', quadrant: 'LL' },
  { number: '34', displayNumber: 4, name: '左下第一前磨牙', quadrant: 'LL' },
  { number: '33', displayNumber: 3, name: '左下尖牙', quadrant: 'LL' },
  { number: '32', displayNumber: 2, name: '左下侧切牙', quadrant: 'LL' },
  { number: '31', displayNumber: 1, name: '左下中切牙', quadrant: 'LL' },
  // 右下颌 (Lower Right) - 屏幕从左到右：8→1
  { number: '48', displayNumber: 8, name: '右下第三磨牙(智齿)', quadrant: 'LR' },
  { number: '47', displayNumber: 7, name: '右下第二磨牙', quadrant: 'LR' },
  { number: '46', displayNumber: 6, name: '右下第一磨牙', quadrant: 'LR' },
  { number: '45', displayNumber: 5, name: '右下第二前磨牙', quadrant: 'LR' },
  { number: '44', displayNumber: 4, name: '右下第一前磨牙', quadrant: 'LR' },
  { number: '43', displayNumber: 3, name: '右下尖牙', quadrant: 'LR' },
  { number: '42', displayNumber: 2, name: '右下侧切牙', quadrant: 'LR' },
  { number: '41', displayNumber: 1, name: '右下中切牙', quadrant: 'LR' },
]

// 儿童乳牙 - 每象限 1-5（1=中切牙, 5=第二乳磨牙）
export const CHILD_TEETH: ToothInfo[] = [
  // 右上颌乳牙, 5→1
  { number: '55', displayNumber: 5, name: '右上第二乳磨牙', quadrant: 'UR' },
  { number: '54', displayNumber: 4, name: '右上第一乳磨牙', quadrant: 'UR' },
  { number: '53', displayNumber: 3, name: '右上乳尖牙', quadrant: 'UR' },
  { number: '52', displayNumber: 2, name: '右上乳侧切牙', quadrant: 'UR' },
  { number: '51', displayNumber: 1, name: '右上乳中切牙', quadrant: 'UR' },
  // 左上颌乳牙, 1→5
  { number: '61', displayNumber: 1, name: '左上乳中切牙', quadrant: 'UL' },
  { number: '62', displayNumber: 2, name: '左上乳侧切牙', quadrant: 'UL' },
  { number: '63', displayNumber: 3, name: '左上乳尖牙', quadrant: 'UL' },
  { number: '64', displayNumber: 4, name: '左上第一乳磨牙', quadrant: 'UL' },
  { number: '65', displayNumber: 5, name: '左上第二乳磨牙', quadrant: 'UL' },
  // 左下颌乳牙, 1→5
  { number: '75', displayNumber: 5, name: '左下第二乳磨牙', quadrant: 'LL' },
  { number: '74', displayNumber: 4, name: '左下第一乳磨牙', quadrant: 'LL' },
  { number: '73', displayNumber: 3, name: '左下乳尖牙', quadrant: 'LL' },
  { number: '72', displayNumber: 2, name: '左下乳侧切牙', quadrant: 'LL' },
  { number: '71', displayNumber: 1, name: '左下乳中切牙', quadrant: 'LL' },
  // 右下颌乳牙, 5→1
  { number: '85', displayNumber: 5, name: '右下第二乳磨牙', quadrant: 'LR' },
  { number: '84', displayNumber: 4, name: '右下第一乳磨牙', quadrant: 'LR' },
  { number: '83', displayNumber: 3, name: '右下乳尖牙', quadrant: 'LR' },
  { number: '82', displayNumber: 2, name: '右下乳侧切牙', quadrant: 'LR' },
  { number: '81', displayNumber: 1, name: '右下乳中切牙', quadrant: 'LR' },
]

// FDI编号 -> 显示编号映射
export const FDI_TO_DISPLAY: Record<string, number> = {}
ADULT_TEETH.forEach(t => { FDI_TO_DISPLAY[t.number] = t.displayNumber })
CHILD_TEETH.forEach(t => { FDI_TO_DISPLAY[t.number] = t.displayNumber })

// 显示编号 -> FDI编号映射
export const DISPLAY_TO_FDI: Record<number, string> = {}
ADULT_TEETH.forEach(t => { DISPLAY_TO_FDI[t.displayNumber] = t.number })
CHILD_TEETH.forEach(t => { DISPLAY_TO_FDI[t.displayNumber] = t.number })

// 牙齿状态列表及其对应颜色
export const TOOTH_STATUSES = [
  { key: '正常', label: '正常', color: '#e8f5e9', borderColor: '#4caf50' },
  { key: '龋齿', label: '龋齿', color: '#ffebee', borderColor: '#f44336' },
  { key: '缺失', label: '缺失', color: '#eeeeee', borderColor: '#9e9e9e' },
  { key: '根管', label: '根管治疗', color: '#fff3e0', borderColor: '#ff9800' },
  { key: '牙冠', label: '牙冠', color: '#fffde7', borderColor: '#ffc107' },
  { key: '种植', label: '种植', color: '#e3f2fd', borderColor: '#2196f3' },
  { key: '拔除', label: '拔除', color: '#efebe9', borderColor: '#795548' },
  { key: '填充', label: '填充', color: '#e8eaf6', borderColor: '#3f51b5' },
]

// 获取状态颜色
export function getToothStatusColor(status: string): { fill: string; border: string } {
  const found = TOOTH_STATUSES.find(s => s.key === status)
  return found
    ? { fill: found.color, border: found.borderColor }
    : { fill: '#ffffff', border: '#cccccc' }
}

// 获取显示编号
export function getDisplayNumber(fdiNumber: string): number {
  return FDI_TO_DISPLAY[fdiNumber] || 0
}

// 获取名称（含显示编号）
export function getToothLabel(fdiNumber: string): string {
  const info = [...ADULT_TEETH, ...CHILD_TEETH].find(t => t.number === fdiNumber)
  if (!info) return `#${fdiNumber}`
  return `#${info.displayNumber} ${info.name}`
}

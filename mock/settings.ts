import { BadgeLevel } from '../types';

export const mockBadges: BadgeLevel[] = [
    { 
        id: 'badge-0', 
        level: 0, 
        name: 'Người mới', 
        icon: 'https://cdn-icons-png.flaticon.com/512/1533/1533913.png', 
        min_points: 0, 
        rule_description: 'Huy hiệu mặc định cho tất cả thành viên mới của cộng đồng.',
        is_active: true 
    },
    { 
        id: 'badge-1', 
        level: 1, 
        name: 'Tân binh', 
        icon: 'https://cdn-icons-png.flaticon.com/512/3176/3176298.png', 
        min_points: 100,
        rule_description: 'Đạt được khi có 100 điểm cộng đồng.',
        is_active: true
    },
    { 
        id: 'badge-2', 
        level: 2, 
        name: 'Nhà thám hiểm', 
        icon: 'https://cdn-icons-png.flaticon.com/512/1055/1055685.png',
        min_points: 500,
        rule_description: 'Đạt được khi có 500 điểm cộng đồng.',
        is_active: true
    },
    { 
        id: 'badge-3', 
        level: 3, 
        name: 'Học giả', 
        icon: 'https://cdn-icons-png.flaticon.com/512/2937/2937734.png',
        min_points: 2000,
        rule_description: 'Đạt được khi có 2000 điểm cộng đồng.',
        is_active: true
    },
    { 
        id: 'badge-4', 
        level: 4, 
        name: 'Bậc thầy Admin', 
        icon: 'https://cdn-icons-png.flaticon.com/512/864/864819.png',
        min_points: 9000, // Điểm cao để user thường không đạt được
        rule_description: 'Huy hiệu đặc biệt dành cho các Quản trị viên.',
        is_active: true
    },
    { 
        id: 'badge-5', 
        level: 5, 
        name: 'Super Admin Tối cao', 
        icon: 'https://cdn-icons-png.flaticon.com/512/1151/1151613.png',
        min_points: 9999, // Điểm cao để user thường không đạt được
        rule_description: 'Huy hiệu danh giá nhất, dành cho Super Admin.',
        is_active: true
    },
];
// js/db.js
// จัดการข้อมูล LocalStorage และข้อมูลเริ่มต้น

const DB_KEY = 'snack_pos_data';

// ข้อมูลจำลองสำหรับเริ่มต้นระบบ
const initialData = {
    categories: [
        { id: 1, name: "รายการขนมทั้งหมด" }
    ],
    products: [
    {
        "id": 1,
        "categoryId": 1,
        "name": "เปี๊ยะมะลิวรรฌ",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 100
    },
    {
        "id": 2,
        "categoryId": 1,
        "name": "เปี๊ยะเขียว",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "แท่ง",
                "capacity": 100
            }
        ]
    },
    {
        "id": 3,
        "categoryId": 1,
        "name": "เปี๊ยะ 10บาท",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 60
    },
    {
        "id": 4,
        "categoryId": 1,
        "name": "เปี๊ยะ 5บาทเล้ง",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 90
    },
    {
        "id": 5,
        "categoryId": 1,
        "name": "เปี๊ยะดำไส้ฟัก-",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 90
    },
    {
        "id": 6,
        "categoryId": 1,
        "name": "เปี๊ยะลิ้ม",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "3แบบ",
                "capacity": 50
            }
        ]
    },
    {
        "id": 7,
        "categoryId": 1,
        "name": "เปี๊ยะ",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "งา",
                "capacity": 60
            },
            {
                "name": "คู่",
                "capacity": 60
            },
            {
                "name": "ตัด",
                "capacity": 60
            }
        ]
    },
    {
        "id": 8,
        "categoryId": 1,
        "name": "ชาววัง 2",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "4ชิ้น",
                "capacity": 60
            }
        ]
    },
    {
        "id": 9,
        "categoryId": 1,
        "name": "ชาววัง 3 ชิ้น",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 60
    },
    {
        "id": 10,
        "categoryId": 1,
        "name": "เหลืองเค็ม",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "หวาน",
                "capacity": 60
            }
        ]
    },
    {
        "id": 11,
        "categoryId": 1,
        "name": "เปี๊ยะสัปปะรดตั้ง",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 100
    },
    {
        "id": 12,
        "categoryId": 1,
        "name": "ลูกเต๋าคู่",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 60
    },
    {
        "id": 13,
        "categoryId": 1,
        "name": "บ้าบิ่นคู่",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 70
    },
    {
        "id": 14,
        "categoryId": 1,
        "name": "บ้าบิ่นถ้วย",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "เหลี่ยม",
                "capacity": 70
            }
        ]
    },
    {
        "id": 15,
        "categoryId": 1,
        "name": "ถั่วพิมพ์",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "2",
                "capacity": 100
            },
            {
                "name": "3",
                "capacity": 100
            },
            {
                "name": "4",
                "capacity": 100
            }
        ]
    },
    {
        "id": 16,
        "categoryId": 1,
        "name": "โดนัทสลัดสีทอง2สี",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 40
    },
    {
        "id": 17,
        "categoryId": 1,
        "name": "ปลาไข่",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 50
    },
    {
        "id": 18,
        "categoryId": 1,
        "name": "พายลัคกี้",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 40
    },
    {
        "id": 19,
        "categoryId": 1,
        "name": "พายกรอบ",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 30
    },
    {
        "id": 20,
        "categoryId": 1,
        "name": "พายเต๋า",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 40
    },
    {
        "id": 21,
        "categoryId": 1,
        "name": "พายสับสับปะรด",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 40
    },
    {
        "id": 22,
        "categoryId": 1,
        "name": "หมี่กรอบหมี",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "แบน",
                "capacity": 50
            }
        ]
    },
    {
        "id": 23,
        "categoryId": 1,
        "name": "ปังกลมรุ่ง",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "ปังพลอย",
                "capacity": 30
            }
        ]
    },
    {
        "id": 24,
        "categoryId": 1,
        "name": "หน้าแตก",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "ฟ",
                "capacity": 40
            },
            {
                "name": "ด",
                "capacity": 40
            },
            {
                "name": "ช",
                "capacity": 40
            }
        ]
    },
    {
        "id": 25,
        "categoryId": 1,
        "name": "รังผึ้งคู่",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "เดี่ยว",
                "capacity": 50
            }
        ]
    },
    {
        "id": 26,
        "categoryId": 1,
        "name": "คุ๊กกี้สิงค์โปร",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 100
    },
    {
        "id": 27,
        "categoryId": 1,
        "name": "ถั่วตัด5บาท",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 120
    },
    {
        "id": 28,
        "categoryId": 1,
        "name": "ถั่วซีก5บาท",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 100
    },
    {
        "id": 29,
        "categoryId": 1,
        "name": "คอเป็ด",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "P",
                "capacity": 100
            },
            {
                "name": "กล่อง",
                "capacity": 100
            }
        ]
    },
    {
        "id": 30,
        "categoryId": 1,
        "name": "ไข่ปลา",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 60
    },
    {
        "id": 31,
        "categoryId": 1,
        "name": "ก้านบัวดั้งเดิม",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 60
    },
    {
        "id": 32,
        "categoryId": 1,
        "name": "ก้านบัวต้มยำ",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 60
    },
    {
        "id": 33,
        "categoryId": 1,
        "name": "กรีบบัวลักยิ้ม",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 60
    },
    {
        "id": 34,
        "categoryId": 1,
        "name": "ครองแครงลาย",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 50
    },
    {
        "id": 35,
        "categoryId": 1,
        "name": "ข้าวเกรียบหมึก",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 40
    },
    {
        "id": 36,
        "categoryId": 1,
        "name": "โรตีใหญ่กล่อง",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 50
    },
    {
        "id": 37,
        "categoryId": 1,
        "name": "นางเล็ด",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 50
    },
    {
        "id": 38,
        "categoryId": 1,
        "name": "ทองม้วน 5.-",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 60
    },
    {
        "id": 39,
        "categoryId": 1,
        "name": "เปี๊ยะทิพย์",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "ค",
                "capacity": 60
            },
            {
                "name": "ห",
                "capacity": 60
            }
        ]
    },
    {
        "id": 40,
        "categoryId": 1,
        "name": "ขนมผิงใหญ่",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "เล็ก",
                "capacity": 50
            }
        ]
    },
    {
        "id": 41,
        "categoryId": 1,
        "name": "พุทราไม้",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 70
    },
    {
        "id": 42,
        "categoryId": 1,
        "name": "เค้กบลู",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "สี",
                "capacity": 40
            },
            {
                "name": "พร้าว",
                "capacity": 40
            }
        ]
    },
    {
        "id": 43,
        "categoryId": 1,
        "name": "เม่งทึงกล่อง",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 50
    },
    {
        "id": 44,
        "categoryId": 1,
        "name": "ปังแผ่น",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "ผ",
                "capacity": 40
            },
            {
                "name": "ต",
                "capacity": 40
            },
            {
                "name": "น",
                "capacity": 40
            },
            {
                "name": "ตอ",
                "capacity": 40
            }
        ]
    },
    {
        "id": 45,
        "categoryId": 1,
        "name": "พายสีสุดา",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "ผ",
                "capacity": 40
            },
            {
                "name": "ส",
                "capacity": 40
            },
            {
                "name": "ต",
                "capacity": 40
            }
        ]
    },
    {
        "id": 46,
        "categoryId": 1,
        "name": "เวเฟอร์5สี",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 50
    },
    {
        "id": 47,
        "categoryId": 1,
        "name": "งาอ่อนแท่ง",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 60
    },
    {
        "id": 48,
        "categoryId": 1,
        "name": "มะยมหยี",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 60
    },
    {
        "id": 49,
        "categoryId": 1,
        "name": "มะขามแก้ว",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 60
    },
    {
        "id": 50,
        "categoryId": 1,
        "name": "กล้วยตาก5บ",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 100
    },
    {
        "id": 51,
        "categoryId": 1,
        "name": "โรลสยาม",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "4สี",
                "capacity": 40
            }
        ]
    },
    {
        "id": 52,
        "categoryId": 1,
        "name": "โรลแท่งSR",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "ช",
                "capacity": 40
            },
            {
                "name": "ต",
                "capacity": 40
            }
        ]
    },
    {
        "id": 53,
        "categoryId": 1,
        "name": "เค้กหอม",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "กลม",
                "capacity": 40
            },
            {
                "name": "เหลี่ยม",
                "capacity": 40
            }
        ]
    },
    {
        "id": 54,
        "categoryId": 1,
        "name": "เค้กหอม",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "คู่",
                "capacity": 50
            },
            {
                "name": "เหลี่ยม",
                "capacity": 50
            },
            {
                "name": "คู่4",
                "capacity": 50
            }
        ]
    },
    {
        "id": 55,
        "categoryId": 1,
        "name": "โดนัทถั่ว",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "ช",
                "capacity": 30
            },
            {
                "name": "ขาว",
                "capacity": 30
            },
            {
                "name": "ชมพู",
                "capacity": 30
            }
        ]
    },
    {
        "id": 56,
        "categoryId": 1,
        "name": "ปังคู่หมี2สี",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 30
    },
    {
        "id": 57,
        "categoryId": 1,
        "name": "โดนัทเก๋",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "โดนัทสีสุดา",
                "capacity": 40
            }
        ]
    },
    {
        "id": 58,
        "categoryId": 1,
        "name": "ปังกลมสีสุดา5สี",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 30
    },
    {
        "id": 59,
        "categoryId": 1,
        "name": "โดนัทนมช้างยิ้ม",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 60
    },
    {
        "id": 60,
        "categoryId": 1,
        "name": "โดนัทโรลเล็ก",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 60
    },
    {
        "id": 61,
        "categoryId": 1,
        "name": "โดนัทโรลใหญ่",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 40
    },
    {
        "id": 62,
        "categoryId": 1,
        "name": "โก๋สัปปะรด",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 60
    },
    {
        "id": 63,
        "categoryId": 1,
        "name": "โก๋เหลี่ยมงาดำ",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 60
    },
    {
        "id": 64,
        "categoryId": 1,
        "name": "โก๋4ชิ้น",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 50
    },
    {
        "id": 65,
        "categoryId": 1,
        "name": "โก๋กลม",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 50
    },
    {
        "id": 66,
        "categoryId": 1,
        "name": "โก๋ปลาแบน",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 50
    },
    {
        "id": 67,
        "categoryId": 1,
        "name": "โก๋ปลาคู๋",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 50
    },
    {
        "id": 68,
        "categoryId": 1,
        "name": "โก๋ไส้ผสม",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 60
    },
    {
        "id": 69,
        "categoryId": 1,
        "name": "โก๋อ่อน",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 60
    },
    {
        "id": 70,
        "categoryId": 1,
        "name": "ปังตัด",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "เผือก",
                "capacity": 40
            },
            {
                "name": "เตย",
                "capacity": 40
            },
            {
                "name": "ชา",
                "capacity": 40
            }
        ]
    },
    {
        "id": 71,
        "categoryId": 1,
        "name": "ปังเชิญชิม4ไส้",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 30
    },
    {
        "id": 72,
        "categoryId": 1,
        "name": "ปังผ่าหยอง",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 24
    },
    {
        "id": 73,
        "categoryId": 1,
        "name": "ปังผ่าสลัด",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 24
    },
    {
        "id": 74,
        "categoryId": 1,
        "name": "ปังหน้าแตกฟ้า5สี",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 30
    },
    {
        "id": 75,
        "categoryId": 1,
        "name": "ปังแพฟ้า3เต้า",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "ผ",
                "capacity": 30
            },
            {
                "name": "ต",
                "capacity": 30
            }
        ]
    },
    {
        "id": 76,
        "categoryId": 1,
        "name": "ปังทวิส",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "ผ",
                "capacity": 30
            },
            {
                "name": "ถ",
                "capacity": 30
            }
        ]
    },
    {
        "id": 77,
        "categoryId": 1,
        "name": "ปังผ่าสี",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "สตอ",
                "capacity": 30
            },
            {
                "name": "เตย",
                "capacity": 30
            },
            {
                "name": "สลัด",
                "capacity": 30
            }
        ]
    },
    {
        "id": 78,
        "categoryId": 1,
        "name": "ปังแท้เผือก",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "เตย",
                "capacity": 30
            }
        ]
    },
    {
        "id": 79,
        "categoryId": 1,
        "name": "ปังคู่แมว",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "ผ",
                "capacity": 24
            },
            {
                "name": "สังขยา",
                "capacity": 24
            }
        ]
    },
    {
        "id": 80,
        "categoryId": 1,
        "name": "ปังแมว",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "ผ",
                "capacity": 24
            },
            {
                "name": "ก",
                "capacity": 24
            },
            {
                "name": "พ",
                "capacity": 24
            },
            {
                "name": "ย",
                "capacity": 24
            },
            {
                "name": "ท",
                "capacity": 24
            }
        ]
    },
    {
        "id": 81,
        "categoryId": 1,
        "name": "ปังแท้น้ำฟ้า",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "ผ",
                "capacity": 30
            },
            {
                "name": "ต",
                "capacity": 30
            },
            {
                "name": "ส",
                "capacity": 30
            }
        ]
    },
    {
        "id": 82,
        "categoryId": 1,
        "name": "ปังหมีกลม",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "หมียาว",
                "capacity": 24
            }
        ]
    },
    {
        "id": 83,
        "categoryId": 1,
        "name": "เค้กช๊อค",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 50
    },
    {
        "id": 84,
        "categoryId": 1,
        "name": "คัพเค้ก4สี",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 40
    },
    {
        "id": 85,
        "categoryId": 1,
        "name": "ช๊อคบอล",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 50
    },
    {
        "id": 86,
        "categoryId": 1,
        "name": "ปังสับSR3สี",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 30
    },
    {
        "id": 87,
        "categoryId": 1,
        "name": "ปังรุ่งท่อน",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "ยาว",
                "capacity": 30
            }
        ]
    },
    {
        "id": 88,
        "categoryId": 1,
        "name": "โรลมือสยาม",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 64
    },
    {
        "id": 89,
        "categoryId": 1,
        "name": "ปังกลมบงกช5สี",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 30
    },
    {
        "id": 90,
        "categoryId": 1,
        "name": "ปังชอ3เต้า",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "ผ",
                "capacity": 24
            },
            {
                "name": "ต",
                "capacity": 24
            }
        ]
    },
    {
        "id": 91,
        "categoryId": 1,
        "name": "ไข่มะเฟือง3แบบ",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 50
    },
    {
        "id": 92,
        "categoryId": 1,
        "name": "ปังเป๋าปังกลม",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 30
    },
    {
        "id": 93,
        "categoryId": 1,
        "name": "ปังเป๋าปังองุ่น",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "สตอ",
                "capacity": 24
            }
        ]
    },
    {
        "id": 94,
        "categoryId": 1,
        "name": "ขนมงาก้อน",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 60
    },
    {
        "id": 95,
        "categoryId": 1,
        "name": "ปังน้ำตาล",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "พลอย30",
                "capacity": 24
            }
        ]
    },
    {
        "id": 96,
        "categoryId": 1,
        "name": "ไข่กลมลาย",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 40
    },
    {
        "id": 97,
        "categoryId": 1,
        "name": "คุ๊กกี้",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "นม",
                "capacity": 40
            },
            {
                "name": "ช๊อต",
                "capacity": 40
            },
            {
                "name": "เตย",
                "capacity": 40
            }
        ]
    },
    {
        "id": 98,
        "categoryId": 1,
        "name": "วุ้นกรอบ",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 100
    },
    {
        "id": 99,
        "categoryId": 1,
        "name": "ขนมอาลัว",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 100
    },
    {
        "id": 100,
        "categoryId": 1,
        "name": "ขนมตุ๊บตั๊บ",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 100
    },
    {
        "id": 101,
        "categoryId": 1,
        "name": "ปังมารุ",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "กลม",
                "capacity": 24
            },
            {
                "name": "ยาว",
                "capacity": 24
            }
        ]
    },
    {
        "id": 102,
        "categoryId": 1,
        "name": "ปัง9995สี",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 30
    },
    {
        "id": 103,
        "categoryId": 1,
        "name": "ขาไก่กรอบ",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 32
    },
    {
        "id": 104,
        "categoryId": 1,
        "name": "ปังกรอบคู่",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 50
    },
    {
        "id": 105,
        "categoryId": 1,
        "name": "เค้กบราวนี่กลม",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 40
    },
    {
        "id": 106,
        "categoryId": 1,
        "name": "บราวนี่เหลียม",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 80
    },
    {
        "id": 107,
        "categoryId": 1,
        "name": "โดนัททอดพลอย",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 40
    },
    {
        "id": 108,
        "categoryId": 1,
        "name": "ปังครัวซองค์สยาม",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 40
    },
    {
        "id": 109,
        "categoryId": 1,
        "name": "ครองแครงปิยจิต",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 100
    },
    {
        "id": 110,
        "categoryId": 1,
        "name": "ปังหยกยิ้ม5สี",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 30
    },
    {
        "id": 111,
        "categoryId": 1,
        "name": "ปังเปีย",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "4สี",
                "capacity": 30
            }
        ]
    },
    {
        "id": 112,
        "categoryId": 1,
        "name": "ปังSS",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "6สี",
                "capacity": 30
            }
        ]
    },
    {
        "id": 113,
        "categoryId": 1,
        "name": "ปังสติ๊กยาว",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 30
    },
    {
        "id": 114,
        "categoryId": 1,
        "name": "ปังสติ๊กกลม",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "นมฮอก",
                "capacity": 30
            }
        ]
    },
    {
        "id": 115,
        "categoryId": 1,
        "name": "ปังระเบิด",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "ผ",
                "capacity": 30
            },
            {
                "name": "ต",
                "capacity": 30
            }
        ]
    },
    {
        "id": 116,
        "categoryId": 1,
        "name": "ปังกลมเชพบิว5สี",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 30
    },
    {
        "id": 117,
        "categoryId": 1,
        "name": "ปังดอกไม้3สี",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 24
    },
    {
        "id": 118,
        "categoryId": 1,
        "name": "ปังสตาร์กลม",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "ยาว",
                "capacity": 30
            }
        ]
    },
    {
        "id": 119,
        "categoryId": 1,
        "name": "ปังเนโกะ4สี",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 30
    },
    {
        "id": 120,
        "categoryId": 1,
        "name": "ปังผ่าครีมจอย",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 24
    },
    {
        "id": 121,
        "categoryId": 1,
        "name": "หอยชำนาญคู่",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 30
    },
    {
        "id": 122,
        "categoryId": 1,
        "name": "หอยครีมจอย",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 50
    },
    {
        "id": 123,
        "categoryId": 1,
        "name": "หอยครีมลาย",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 30
    },
    {
        "id": 124,
        "categoryId": 1,
        "name": "หอยครีมสยาม",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 30
    },
    {
        "id": 125,
        "categoryId": 1,
        "name": "หอยครีมสตาร์",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "พิชัย",
                "capacity": 30
            }
        ]
    },
    {
        "id": 126,
        "categoryId": 1,
        "name": "ไข่ถุง4สี",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 50
    },
    {
        "id": 127,
        "categoryId": 1,
        "name": "ปัง จู 5สี",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 30
    },
    {
        "id": 128,
        "categoryId": 1,
        "name": "ปังมน4สี",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 30
    },
    {
        "id": 129,
        "categoryId": 1,
        "name": "ปังสัป",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "ผ",
                "capacity": 30
            },
            {
                "name": "เตย",
                "capacity": 30
            },
            {
                "name": "สตอ",
                "capacity": 30
            }
        ]
    },
    {
        "id": 130,
        "categoryId": 1,
        "name": "โดนัทงา",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 30
    },
    {
        "id": 131,
        "categoryId": 1,
        "name": "โดนัทSRสลัด",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 30
    },
    {
        "id": 132,
        "categoryId": 1,
        "name": "ปังกล่อง2แบบ",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 24
    },
    {
        "id": 133,
        "categoryId": 1,
        "name": "ปังกรอบป๊อบ",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 40
    },
    {
        "id": 134,
        "categoryId": 1,
        "name": "ปังกรอบ",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "แมวกทม",
                "capacity": 40
            }
        ]
    },
    {
        "id": 135,
        "categoryId": 1,
        "name": "ปังกรอบกระเทียม",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 40
    },
    {
        "id": 136,
        "categoryId": 1,
        "name": "พิชซ่ากทม",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 30
    },
    {
        "id": 137,
        "categoryId": 1,
        "name": "เปา",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "ขาว",
                "capacity": 40
            },
            {
                "name": "เตย",
                "capacity": 40
            },
            {
                "name": "เผือก",
                "capacity": 40
            }
        ]
    },
    {
        "id": 138,
        "categoryId": 1,
        "name": "เกลียวคู่",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 50
    },
    {
        "id": 139,
        "categoryId": 1,
        "name": "เกลียว4ชิ้น",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 50
    },
    {
        "id": 140,
        "categoryId": 1,
        "name": "ไข่นก",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 50
    },
    {
        "id": 141,
        "categoryId": 1,
        "name": "โดนัทตั้ง",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "โดนัทแผ่น",
                "capacity": 50
            }
        ]
    },
    {
        "id": 142,
        "categoryId": 1,
        "name": "เกลียวเดียว",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 50
    },
    {
        "id": 143,
        "categoryId": 1,
        "name": "เปี๊ยะ",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "เตย",
                "capacity": 60
            },
            {
                "name": "พร้าว",
                "capacity": 60
            },
            {
                "name": "เค็ม",
                "capacity": 60
            }
        ]
    },
    {
        "id": 144,
        "categoryId": 1,
        "name": "ไดฟูกุ",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "variations": [
            {
                "name": "ข",
                "capacity": 80
            },
            {
                "name": "ม",
                "capacity": 80
            },
            {
                "name": "ห",
                "capacity": 80
            },
            {
                "name": "ช",
                "capacity": 80
            },
            {
                "name": "ด",
                "capacity": 80
            }
        ]
    },
    {
        "id": 145,
        "categoryId": 1,
        "name": "คุ๊กกี้หนอน",
        "price": 3.85,
        "costPrice": 3.4,
        "stock": 100,
        "capacity": 80
    }
],
    sales: []
};

// ฟังก์ชันตรวจสอบและสร้างฐานข้อมูลเริ่มต้น
function initDB() {
    if (!localStorage.getItem(DB_KEY)) {
        migrateProductPrices(initialData);
        localStorage.setItem(DB_KEY, JSON.stringify(initialData));
    } else {
        try {
            let data = JSON.parse(localStorage.getItem(DB_KEY));
            if (!data || !data.categories || !data.products) {
                migrateProductPrices(initialData);
                localStorage.setItem(DB_KEY, JSON.stringify(initialData));
            } else {
                let shouldSave = false;

                if (!Array.isArray(data.sales)) {
                    data.sales = [];
                    shouldSave = true;
                }

                if (!localStorage.getItem('products_migrated_v3')) {
                    // One-time migration to replace products but KEEP history
                    data.products = initialData.products;
                    data.categories = initialData.categories;
                    shouldSave = true;
                    localStorage.setItem('products_migrated_v3', 'true');
                }

                if (migrateProductPrices(data)) {
                    shouldSave = true;
                }

                if (shouldSave) {
                    localStorage.setItem(DB_KEY, JSON.stringify(data));
                }
            }
        } catch(e) {
            migrateProductPrices(initialData);
            localStorage.setItem(DB_KEY, JSON.stringify(initialData));
        }
    }
}

/** บิลทดสอบ 1 ใบ: สั่งทุกสินค้า/ทุกไส้ ลังละ 1 — ไม่หักสต็อก (รันครั้งเดียวต่อเครื่อง จนกว่าจะลบ flag ใน localStorage) */
function seedMegaTestBillIfNeeded() {
    const FLAG = 'snack_pos_mega_seed_v1';
    if (localStorage.getItem(FLAG)) return;
    try {
        const raw = localStorage.getItem(DB_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (!Array.isArray(data.products) || !Array.isArray(data.sales)) return;
        const marker = 'ทดสอบ_ทุกรายการทุกไส้';
        if (data.sales.some((s) => s && s.customerName === marker)) {
            localStorage.setItem(FLAG, '1');
            return;
        }

        const dateObj = new Date();
        const year = (dateObj.getFullYear() + 543).toString().slice(-2);
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const prefix = `INV-${year}${month}`;
        let maxNum = 0;
        data.sales.forEach((s) => {
            if (!s || !String(s.id).startsWith(prefix)) return;
            const numStr = String(s.id).slice(-4);
            const num = parseInt(numStr, 10);
            if (!isNaN(num) && num > maxNum) maxNum = num;
        });
        const invoiceId = `${prefix}${String(maxNum + 1).padStart(4, '0')}`;

        const lines = [];
        for (const p of data.products) {
            const piecePrice = Number(p.price);
            const price = Number.isFinite(piecePrice) ? piecePrice : 0;
            if (p.variations && p.variations.length > 0) {
                for (const v of p.variations) {
                    const boxQty = parseInt(v.capacity, 10) || 1;
                    const qty = 1;
                    const name = `${p.name} (${v.name})`;
                    lines.push({ p, name, productId: p.id, price, boxQty, qty, subtotal: qty * boxQty * price });
                }
            } else {
                const boxQty = parseInt(p.capacity, 10) || 1;
                const qty = 1;
                lines.push({ p, name: p.name, productId: p.id, price, boxQty, qty, subtotal: qty * boxQty * price });
            }
        }

        let totalAmount = 0;
        let totalCost = 0;
        for (const line of lines) {
            totalAmount += line.subtotal;
            const c = Number(line.p.costPrice ?? line.p.cost ?? 0) || 0;
            totalCost += c * line.boxQty * line.qty;
        }

        const items = lines.map((line) => ({
            name: line.name,
            qty: line.qty,
            productId: line.productId,
            price: line.boxQty * line.price,
            subtotal: line.subtotal,
            capacity: line.boxQty,
            pricePerPiece: line.price,
        }));

        data.sales.push({
            id: invoiceId,
            customerName: marker,
            district: 'ทดสอบพิมพ์',
            items,
            totalAmount,
            totalCost,
            profit: totalAmount - totalCost,
            date: dateObj.toISOString(),
        });

        localStorage.setItem(DB_KEY, JSON.stringify(data));
        localStorage.setItem(FLAG, '1');
    } catch (e) {
        console.warn('[SnackPOS] mega test bill seed skipped:', e);
    }
}

// ฟังก์ชันดึงข้อมูลทั้งหมด
function migrateProductPrices(data) {
    if (!data || !Array.isArray(data.products)) return false;

    let changed = false;
    data.products.forEach(product => {
        const basePrice = Number(product.price);
        const fallbackPrice = Number.isFinite(basePrice) ? basePrice : 0;

        if (typeof product.priceAlt === 'undefined') {
            const savedAlt = Number(product.salePriceAlt ?? product.price2 ?? product.altPrice);
            product.priceAlt = Number.isFinite(savedAlt) ? savedAlt : (Math.abs(fallbackPrice - 3.85) < 0.001 ? 3.75 : fallbackPrice);
            changed = true;
        }

        if (typeof product.price === 'undefined' || !Number.isFinite(basePrice)) {
            product.price = fallbackPrice;
            changed = true;
        }
    });

    return changed;
}

function getDB() {
    const data = localStorage.getItem(DB_KEY);
    const parsed = data ? JSON.parse(data) : null;
    if (parsed && !Array.isArray(parsed.sales)) parsed.sales = [];
    if (migrateProductPrices(parsed)) saveDB(parsed);
    return parsed;
}

// ฟังก์ชันบันทึกข้อมูล
function saveDB(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
}

// ผู้ใช้ใหม่เริ่มด้วยแอพเปล่า — ไม่มีสินค้าหรือหมวดหมู่โหลดไว้ให้
// (ข้อมูลที่มีอยู่แล้วใน localStorage จะไม่ถูกแตะต้อง)
initialData.products = [];
initialData.categories = [];

// ทำการเริ่มต้นทันทีเมื่อโหลดไฟล์นี้
initDB();
// seedMegaTestBillIfNeeded(); // ปิดการ seed ข้อมูลทดสอบ

// แจกจ่าย API ให้กับระบบ
window.DB = {
    get: getDB,
    save: saveDB,
    reset: () => {
        localStorage.setItem(DB_KEY, JSON.stringify(initialData));
        location.reload();
    }
};

// Global Custom Confirm Modal
window.showConfirmModal = function(message, onConfirm) {
    let modal = document.getElementById('global-confirm-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'global-confirm-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.right = '0';
        modal.style.bottom = '0';
        modal.style.background = 'rgba(0,0,0,0.5)';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '10000';
        modal.innerHTML = `
            <div class="modal-content text-center" style="background: var(--surface); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); width: 90%; max-width: 400px; padding: 2rem;">
                <h3 id="global-confirm-msg" class="mb-4" style="white-space: pre-wrap; font-size: 1.2rem; font-weight: normal; color: var(--text-main);"></h3>
                <div class="flex gap-4 justify-center mt-4">
                    <button class="btn btn-outline flex-1" id="global-confirm-cancel">ยกเลิก</button>
                    <button class="btn btn-danger flex-1" id="global-confirm-ok">ตกลง</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('global-confirm-msg').innerText = message;
    modal.style.display = 'flex';
    
    const cancelBtn = document.getElementById('global-confirm-cancel');
    const okBtn = document.getElementById('global-confirm-ok');
    
    // Remove old listeners by cloning
    const newCancelBtn = cancelBtn.cloneNode(true);
    const newOkBtn = okBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    okBtn.parentNode.replaceChild(newOkBtn, okBtn);
    
    newCancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    newOkBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        onConfirm();
    });
    
    // Focus the cancel button to prevent Enter from confirming accidentally
    setTimeout(() => {
        newCancelBtn.focus();
    }, 50);
};

// --- Settings Modal & Data Management ---
window.openSettingsModal = function() {
    let modal = document.getElementById('global-settings-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'global-settings-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.right = '0';
        modal.style.bottom = '0';
        modal.style.background = 'rgba(0,0,0,0.5)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '10000';
        
        modal.innerHTML = `
            <div class="modal-content" style="background: var(--surface); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); width: 90%; max-width: 500px; overflow: hidden; display: flex; flex-direction: column;">
                <div style="padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0;" data-i18n="settings_title">ตั้งค่า (Settings)</h3>
                    <button onclick="closeSettingsModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted);">&times;</button>
                </div>
                <div style="padding: 1.5rem;">
                    <!-- Language Selection -->
                    <div style="margin-bottom: 1.5rem;">
                        <h4 style="margin-bottom: 0.5rem; color: var(--primary);" data-i18n="settings_language">เปลี่ยนภาษา (Language)</h4>
                        <div style="display: flex; gap: 10px;">
                            <button class="btn btn-outline flex-1" onclick="changeLanguage('th')" id="lang-th-btn">🇹🇭 ไทย</button>
                            <button class="btn btn-outline flex-1" onclick="changeLanguage('en')" id="lang-en-btn">🇬🇧 English</button>
                        </div>
                    </div>
                    
                    <!-- Backup & Restore -->
                    <div>
                        <h4 style="margin-bottom: 0.5rem; color: var(--primary);" data-i18n="settings_data">การจัดการข้อมูล (Backup & Restore)</h4>
                        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;" data-i18n="settings_data_desc">บันทึกข้อมูลเพื่อนำไปใช้คอมพิวเตอร์เครื่องอื่น</p>
                        <div style="display: flex; gap: 10px;">
                            <button class="btn btn-outline flex-1" onclick="window.exportData()">
                                <i class="material-icons" style="margin-right: 5px; vertical-align: middle;">download</i> <span data-i18n="btn_export">ส่งออก (Export)</span>
                            </button>
                            <button class="btn btn-primary flex-1" onclick="document.getElementById('global-import-file').click()">
                                <i class="material-icons" style="margin-right: 5px; vertical-align: middle;">upload</i> <span data-i18n="btn_import">นำเข้า (Import)</span>
                            </button>
                            <input type="file" id="global-import-file" style="display: none;" accept=".json" onchange="window.importData(event)">
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Update active state of language buttons
    const currentLang = localStorage.getItem('snack_pos_lang') || 'th';
    document.getElementById('lang-th-btn').style.background = currentLang === 'th' ? 'var(--primary)' : 'white';
    document.getElementById('lang-th-btn').style.color = currentLang === 'th' ? 'white' : 'var(--text-main)';
    document.getElementById('lang-en-btn').style.background = currentLang === 'en' ? 'var(--primary)' : 'white';
    document.getElementById('lang-en-btn').style.color = currentLang === 'en' ? 'white' : 'var(--text-main)';
    
    modal.style.display = 'flex';
};

window.closeSettingsModal = function() {
    const modal = document.getElementById('global-settings-modal');
    if (modal) modal.style.display = 'none';
};

window.exportData = function() {
    const dataStr = JSON.stringify(window.DB.get(), null, 2);
    
    // Check if running inside pywebview application
    if (window.pywebview && window.pywebview.api) {
        window.pywebview.api.export_data(dataStr).then(success => {
            if (success) {
                alert("ส่งออกข้อมูลสำเร็จ (Export Successful)");
            }
        }).catch(err => {
            console.error("Export error", err);
            alert("เกิดข้อผิดพลาดในการส่งออก (Export Failed)");
        });
        return;
    }
    
    // Web browser fallback
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `snack_management_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

window.importData = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            // Basic validation
            if (importedData.categories && importedData.products) {
                window.showConfirmModal("คุณต้องการกู้คืนข้อมูลจากไฟล์นี้ใช่หรือไม่?\nคำเตือน: ข้อมูลเดิมทั้งหมดจะถูกเขียนทับทันที!", () => {
                    window.DB.save(importedData);
                    window.location.reload();
                });
            } else {
                alert("ไฟล์ข้อมูลไม่ถูกต้อง");
            }
        } catch (err) {
            alert("ไม่สามารถอ่านไฟล์ได้ โปรดตรวจสอบว่าเป็นไฟล์ .json ที่ถูกต้อง");
            console.error(err);
        }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
};

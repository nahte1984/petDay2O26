// 中文動物名 → 英文搜尋詞對照表
//
// 為什麼要這張表：Pexels 只吃英文關鍵字，而線上翻譯 API 常把「柴犬」翻成
// 奇怪的東西。先查表命中率最高、不消耗任何額度，查不到才 fallback 到翻譯 API。
//
// 要新增動物就直接加一行，key 用中文、value 用適合搜圖的英文詞。
export const ANIMAL_DICT = {
  // 貓科
  貓: 'cat', 貓咪: 'cat', 小貓: 'kitten', 橘貓: 'orange tabby cat',
  黑貓: 'black cat', 白貓: 'white cat', 三花貓: 'calico cat',
  賓士貓: 'tuxedo cat', 虎斑貓: 'tabby cat', 布偶貓: 'ragdoll cat',
  波斯貓: 'persian cat', 暹羅貓: 'siamese cat', 英短: 'british shorthair cat',
  美短: 'american shorthair cat', 摺耳貓: 'scottish fold cat',
  無毛貓: 'sphynx cat', 緬因貓: 'maine coon cat',
  獅子: 'lion', 母獅: 'lioness', 老虎: 'tiger', 白虎: 'white tiger',
  豹: 'leopard', 花豹: 'leopard', 獵豹: 'cheetah', 黑豹: 'black panther',
  美洲獅: 'cougar', 山貓: 'lynx', 猞猁: 'lynx', 藪貓: 'serval',

  // 犬科
  狗: 'dog', 狗狗: 'dog', 小狗: 'puppy', 柴犬: 'shiba inu',
  秋田犬: 'akita dog', 柯基: 'corgi', 柯基犬: 'corgi', 科基: 'corgi',
  黃金獵犬: 'golden retriever', 拉布拉多: 'labrador retriever',
  貴賓狗: 'poodle', 貴賓犬: 'poodle', 博美: 'pomeranian',
  哈士奇: 'husky', 雪橇犬: 'siberian husky', 薩摩耶: 'samoyed',
  臘腸狗: 'dachshund', 鬥牛犬: 'bulldog', 法鬥: 'french bulldog',
  巴哥: 'pug', 沙皮狗: 'shar pei dog', 米格魯: 'beagle',
  吉娃娃: 'chihuahua', 邊境牧羊犬: 'border collie', 牧羊犬: 'shepherd dog',
  德國狼犬: 'german shepherd', 大丹狗: 'great dane', 聖伯納: 'saint bernard',
  馬爾濟斯: 'maltese dog', 雪納瑞: 'schnauzer', 比熊: 'bichon frise',
  西施犬: 'shih tzu', 狼: 'wolf', 狐狸: 'fox', 北極狐: 'arctic fox',
  柴柴: 'shiba inu', 土狗: 'mixed breed dog', 米克斯: 'mixed breed dog',
  郊狼: 'coyote', 豺: 'jackal', 非洲野犬: 'african wild dog',

  // 熊與大型陸生
  熊: 'bear', 棕熊: 'brown bear', 黑熊: 'black bear', 北極熊: 'polar bear',
  無尾熊: 'koala', 雪貂: 'ferret', 熊貓: 'panda', 貓熊: 'panda',
  小熊貓: 'red panda', 紅熊貓: 'red panda', 樹懶: 'sloth',
  大象: 'elephant', 象: 'elephant', 河馬: 'hippopotamus',
  犀牛: 'rhinoceros', 長頸鹿: 'giraffe', 斑馬: 'zebra',
  駱駝: 'camel', 羊駝: 'alpaca', 草泥馬: 'llama', 駝羊: 'llama',
  馬: 'horse', 小馬: 'pony', 驢: 'donkey', 騾: 'mule',
  牛: 'cow', 乳牛: 'dairy cow', 水牛: 'buffalo', 野牛: 'bison',
  公牛: 'bull', 羊: 'sheep', 綿羊: 'sheep', 山羊: 'goat',
  豬: 'pig', 小豬: 'piglet', 山豬: 'wild boar', 野豬: 'wild boar',
  鹿: 'deer', 梅花鹿: 'sika deer', 麋鹿: 'moose', 馴鹿: 'reindeer',
  羚羊: 'antelope', 袋鼠: 'kangaroo', 袋熊: 'wombat',
  刺蝟: 'hedgehog', 豪豬: 'porcupine', 穿山甲: 'pangolin',
  水獺: 'otter', 海獺: 'sea otter', 獴: 'mongoose', 狐猴: 'lemur',
  臭鼬: 'skunk', 浣熊: 'raccoon', 貉: 'raccoon dog', 狸: 'raccoon dog',
  食蟻獸: 'anteater', 犰狳: 'armadillo', 蝙蝠: 'bat',
  土撥鼠: 'groundhog', 草原犬鼠: 'prairie dog', 狐蒙: 'meerkat',
  貓鼬: 'meerkat', 獾: 'badger', 鼬: 'weasel', 貂: 'marten',

  // 靈長類
  猴子: 'monkey', 猴: 'monkey', 猩猩: 'gorilla', 大猩猩: 'gorilla',
  黑猩猩: 'chimpanzee', 紅毛猩猩: 'orangutan', 長臂猿: 'gibbon',
  狒狒: 'baboon', 獼猴: 'macaque', 眼鏡猴: 'tarsier',
  日本獼猴: 'japanese macaque',

  // 齧齒與小型
  老鼠: 'mouse', 鼠: 'mouse', 倉鼠: 'hamster', 黃金鼠: 'hamster',
  天竺鼠: 'guinea pig', 松鼠: 'squirrel', 飛鼠: 'flying squirrel',
  花栗鼠: 'chipmunk', 兔子: 'rabbit', 兔: 'rabbit', 小兔子: 'bunny',
  垂耳兔: 'lop rabbit', 龍貓: 'chinchilla', 水豚: 'capybara',
  裸鼴鼠: 'naked mole rat', 河狸: 'beaver', 海狸: 'beaver',

  // 鳥類
  鳥: 'bird', 小鳥: 'small bird', 麻雀: 'sparrow', 鴿子: 'pigeon',
  烏鴉: 'crow', 老鷹: 'eagle', 鷹: 'hawk', 隼: 'falcon',
  貓頭鷹: 'owl', 鸚鵡: 'parrot', 金剛鸚鵡: 'macaw',
  鳳頭鸚鵡: 'cockatoo', 虎皮鸚鵡: 'budgie', 鸛: 'stork',
  企鵝: 'penguin', 國王企鵝: 'king penguin', 天鵝: 'swan',
  鴨子: 'duck', 鴨: 'duck', 小鴨: 'duckling', 鵝: 'goose',
  雞: 'chicken', 公雞: 'rooster', 母雞: 'hen', 小雞: 'chick',
  火雞: 'turkey', 孔雀: 'peacock', 鶴: 'crane bird',
  丹頂鶴: 'red crowned crane', 紅鶴: 'flamingo', 火鶴: 'flamingo',
  鴕鳥: 'ostrich', 鵜鶘: 'pelican', 海鷗: 'seagull',
  信天翁: 'albatross', 蜂鳥: 'hummingbird', 啄木鳥: 'woodpecker',
  翠鳥: 'kingfisher', 巨嘴鳥: 'toucan', 白鷺: 'egret',
  鵂鶹: 'owlet', 燕子: 'swallow bird', 布穀鳥: 'cuckoo',
  奇異鳥: 'kiwi bird', 鴯鶓: 'emu', 鵲: 'magpie',

  // 水生
  魚: 'fish', 金魚: 'goldfish', 熱帶魚: 'tropical fish',
  鯉魚: 'koi fish', 錦鯉: 'koi fish', 小丑魚: 'clownfish',
  河豚: 'pufferfish', 翻車魚: 'sunfish', 曼波魚: 'sunfish',
  鯊魚: 'shark', 大白鯊: 'great white shark', 鯨魚: 'whale',
  藍鯨: 'blue whale', 虎鯨: 'orca', 殺人鯨: 'orca',
  海豚: 'dolphin', 海豹: 'seal', 海獅: 'sea lion', 海象: 'walrus',
  海馬: 'seahorse', 水母: 'jellyfish', 章魚: 'octopus',
  烏賊: 'squid', 花枝: 'cuttlefish', 龍蝦: 'lobster',
  蝦: 'shrimp', 螃蟹: 'crab', 寄居蟹: 'hermit crab',
  海星: 'starfish', 海膽: 'sea urchin', 海龜: 'sea turtle',
  儒艮: 'dugong', 海牛: 'manatee', 鰻魚: 'eel',
  鮭魚: 'salmon', 鮪魚: 'tuna', 鯰魚: 'catfish',

  // 爬蟲兩棲
  蛇: 'snake', 蟒蛇: 'python snake', 眼鏡蛇: 'cobra',
  蜥蜴: 'lizard', 變色龍: 'chameleon', 壁虎: 'gecko',
  鬃獅蜥: 'bearded dragon', 鬣蜥: 'iguana', 科摩多龍: 'komodo dragon',
  烏龜: 'turtle', 陸龜: 'tortoise', 鱷魚: 'crocodile',
  青蛙: 'frog', 樹蛙: 'tree frog', 蟾蜍: 'toad',
  蠑螈: 'salamander', 六角恐龍: 'axolotl',

  // 昆蟲與其他
  蝴蝶: 'butterfly', 蜜蜂: 'bee', 螞蟻: 'ant', 蜻蜓: 'dragonfly',
  瓢蟲: 'ladybug', 螳螂: 'praying mantis', 蟬: 'cicada',
  甲蟲: 'beetle', 獨角仙: 'rhinoceros beetle', 鍬形蟲: 'stag beetle',
  蜘蛛: 'spider', 蝸牛: 'snail', 蚯蚓: 'earthworm',
  蟑螂: 'cockroach', 蚱蜢: 'grasshopper', 蟋蟀: 'cricket insect',
  螢火蟲: 'firefly', 毛毛蟲: 'caterpillar',

  // 神獸／趣味（同事最愛提名的那種）
  恐龍: 'dinosaur', 暴龍: 'tyrannosaurus', 龍: 'dragon',
  獨角獸: 'unicorn', 鳳凰: 'phoenix bird', 麒麟: 'qilin',
  哥吉拉: 'godzilla', 皮卡丘: 'pikachu',
};

// 把使用者輸入正規化：去空白、全轉小寫（英文用）
export function normalizeAnimal(input) {
  return String(input || '').trim().replace(/\s+/g, ' ');
}

// 純英文輸入就直接用；中文先查表；查不到回傳 null 交給翻譯 API
export function localTranslate(input) {
  const q = normalizeAnimal(input);
  if (!q) return null;
  if (/^[a-zA-Z\s'-]+$/.test(q)) return q.toLowerCase();

  if (ANIMAL_DICT[q]) return ANIMAL_DICT[q];

  // 「像一隻胖胖的貓」這種句子 → 撈出最長的命中詞
  const hits = Object.keys(ANIMAL_DICT)
    .filter((k) => q.includes(k))
    .sort((a, b) => b.length - a.length);
  return hits.length ? ANIMAL_DICT[hits[0]] : null;
}

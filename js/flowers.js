/* Petal Post — flower catalog, SVG flower heads and bouquet layout.
   Everything is drawn procedurally so a bouquet can be rebuilt from a short code. */
(function () {
  'use strict';

  const CATALOG = [
    { id: 'rr', type: 'rose', name: 'Red Rose', meaning: 'Deep love & passion', c: { base: '#D7263D', dark: '#9E1B2E', light: '#F25C6E' } },
    { id: 'rp', type: 'rose', name: 'Pink Rose', meaning: 'Gratitude & admiration', c: { base: '#F28BA8', dark: '#CF5F7F', light: '#FFC2D3' } },
    { id: 'ri', type: 'rose', name: 'Ivory Rose', meaning: 'New beginnings & honesty', c: { base: '#F7EEDD', dark: '#D3BF9C', light: '#FFFFFF' } },
    { id: 'ry', type: 'rose', name: 'Yellow Rose', meaning: 'Friendship & joy', c: { base: '#F9C440', dark: '#D49512', light: '#FFE08A' } },
    { id: 'ty', type: 'tulip', name: 'Yellow Tulip', meaning: 'Cheerful thoughts', c: { base: '#F7C948', dark: '#D9A21B', light: '#FFE9A3' } },
    { id: 'tp', type: 'tulip', name: 'Purple Tulip', meaning: 'Admiration & respect', c: { base: '#9B6BD3', dark: '#6E43A8', light: '#C9AEEE' } },
    { id: 'to', type: 'tulip', name: 'Coral Tulip', meaning: 'Warm affection', c: { base: '#FF7F66', dark: '#DB4E37', light: '#FFB9AA' } },
    { id: 'dz', type: 'daisy', name: 'Daisy', meaning: 'Innocence & loyal love', c: { base: '#FFFFFF', dark: '#DCD3C4', light: '#F4B63F' } },
    { id: 'sf', type: 'sunflower', name: 'Sunflower', meaning: 'Adoration & warmth', c: { base: '#F6B829', dark: '#DD8A10', light: '#5A3A1E' } },
    { id: 'lv', type: 'lavender', name: 'Lavender', meaning: 'Calm, grace & devotion', c: { base: '#9A7FD1', dark: '#6F55A8', light: '#C2B0EA' } },
    { id: 'sk', type: 'sakura', name: 'Cherry Blossom', meaning: 'Renewal & gentle beauty', c: { base: '#FBCFDA', dark: '#E594AB', light: '#FFF0F4' } },
    { id: 'ly', type: 'lily', name: 'White Lily', meaning: 'Peace & sympathy', c: { base: '#FFF9F1', dark: '#DCCBB2', light: '#D7E6A6' } },
    { id: 'bb', type: 'babysbreath', name: "Baby's Breath", meaning: 'Everlasting love', c: { base: '#FFFFFF', dark: '#D6CFC3', light: '#F7F3EC' } },
    { id: 'pk', type: 'peony', name: 'Pink Peony', meaning: 'Romance & a happy life', c: { base: '#F7A1B8', dark: '#D96E8C', light: '#FFD0DC' } },
    { id: 'pc', type: 'peony', name: 'Coral Peony', meaning: 'Good fortune & joy', c: { base: '#FF9A86', dark: '#E06A55', light: '#FFC9BC' } },
    { id: 'cr', type: 'carnation', name: 'Red Carnation', meaning: 'Deep love & admiration', c: { base: '#E0344F', dark: '#A81E36', light: '#F7738A' } },
    { id: 'cp', type: 'carnation', name: 'Pink Carnation', meaning: "Gratitude & a mother's love", c: { base: '#F7B2C6', dark: '#E07F9D', light: '#FFE0EA' } },
    { id: 'rn', type: 'ranunculus', name: 'Peach Ranunculus', meaning: "You're radiant & charming", c: { base: '#FFC2A6', dark: '#E99A7C', light: '#FFE2D4' } },
    { id: 'pr', type: 'poppy', name: 'Red Poppy', meaning: 'Remembrance & dreams', c: { base: '#E8402F', dark: '#B22A1E', light: '#FF7A66' } },
    { id: 'po', type: 'poppy', name: 'Orange Poppy', meaning: 'Imagination & success', c: { base: '#FF9B3D', dark: '#E0741A', light: '#FFC47F' } },
    { id: 'go', type: 'gerbera', name: 'Orange Gerbera', meaning: 'Cheer & warm energy', c: { base: '#FF8A3D', dark: '#E5671C', light: '#FFD24A' } },
    { id: 'gp', type: 'gerbera', name: 'Pink Gerbera', meaning: 'Playful joy', c: { base: '#FF6FA0', dark: '#E04C80', light: '#FFD24A' } },
    { id: 'hb', type: 'hydrangea', name: 'Blue Hydrangea', meaning: 'Heartfelt gratitude', c: { base: '#8FB3E8', dark: '#5E86C9', light: '#C9DCF7' } },
    { id: 'hl', type: 'hydrangea', name: 'Lilac Hydrangea', meaning: 'Grace & understanding', c: { base: '#C3A6E3', dark: '#9978C6', light: '#E6D8F5' } },
    { id: 'fm', type: 'forgetmenot', name: 'Forget-me-not', meaning: 'True love & memories', c: { base: '#7FB2F0', dark: '#5A8FD6', light: '#F7D04A' } },
    { id: 'op', type: 'orchid', name: 'Purple Orchid', meaning: 'Luxury & admiration', c: { base: '#C58BD9', dark: '#8E4FA8', light: '#EBCDF2' } },
    { id: 'ow', type: 'orchid', name: 'White Orchid', meaning: 'Elegance & reverence', c: { base: '#FFFDF8', dark: '#D9CDB9', light: '#F3E6F5', accent: '#E79AB8' } },
    { id: 'eu', type: 'eucalyptus', name: 'Eucalyptus', meaning: 'Protection & healing', c: { base: '#9DB8A4', dark: '#7E9C86', light: '#C9D9CC' } },
    // ---- more colours of the classics (IDs are two letters: they travel inside gift links)
    { id: 'rq', type: 'rose', name: 'Peach Rose', meaning: 'Sincerity & thanks', c: { base: '#FFB38A', dark: '#E2865C', light: '#FFD8C1' } },
    { id: 'rl', type: 'rose', name: 'Lavender Rose', meaning: 'Love at first sight', c: { base: '#B9A1DE', dark: '#8A6CBE', light: '#E1D4F5' } },
    { id: 'rb', type: 'rose', name: 'Blue Rose', meaning: 'The impossible, made real', c: { base: '#6F8EDB', dark: '#3F5AAD', light: '#AFC2F4' } },
    { id: 'tr', type: 'tulip', name: 'Red Tulip', meaning: 'A declaration of love', c: { base: '#D9263A', dark: '#9E1527', light: '#F2697A' } },
    { id: 'tk', type: 'tulip', name: 'Pink Tulip', meaning: 'Care & good wishes', c: { base: '#F59AB5', dark: '#D9698A', light: '#FFD0DE' } },
    { id: 'tw', type: 'tulip', name: 'White Tulip', meaning: 'Forgiveness & fresh starts', c: { base: '#FBF7EE', dark: '#D7CCB6', light: '#FFFFFF' } },
    { id: 'tg', type: 'tulip', name: 'Orange Tulip', meaning: 'Energy & enthusiasm', c: { base: '#FF8C2E', dark: '#DB6311', light: '#FFC07A' } },
    { id: 'tl', type: 'tulip', name: 'Blue Tulip', meaning: 'Tranquillity & trust', c: { base: '#8E9BE0', dark: '#5F6CC0', light: '#C5CCF5' } },
    { id: 'tb', type: 'tulip', name: 'Black Tulip', meaning: 'Power & quiet elegance', c: { base: '#4A1E3D', dark: '#2B0F23', light: '#86477A' } },
    { id: 'ts', type: 'tulip', name: 'Flamed Tulip', meaning: 'Beautiful eyes', c: { base: '#FFF3DC', dark: '#D9C7A6', light: '#FFFFFF', flame: '#D2394A' } },
    { id: 'tx', type: 'parrot', name: 'Parrot Tulip', meaning: 'Playful flair', c: { base: '#F49AC1', dark: '#C2577F', light: '#FFD3E6', accent: '#8DBB5C' } },
    { id: 'td', type: 'doubletulip', name: 'Double Tulip', meaning: 'Abundance & a full heart', c: { base: '#F7B8C8', dark: '#D9829C', light: '#FFE3EB' } },
    { id: 'lb', type: 'lily', name: 'Blue Lily', meaning: 'Trust & calm confidence', c: { base: '#86A9EC', dark: '#4F76C6', light: '#DCE8FF' } },
    { id: 'lp', type: 'lily', name: 'Stargazer Lily', meaning: 'Ambition & big dreams', c: { base: '#F28AB0', dark: '#C2416F', light: '#FFF1F6', spots: '#A8164C' } },
    { id: 'lo', type: 'lily', name: 'Tiger Lily', meaning: 'Confidence & pride', c: { base: '#FF7A1F', dark: '#D9530A', light: '#FFC48A', spots: '#5A2A14' } },
    { id: 'lj', type: 'lily', name: 'Yellow Lily', meaning: 'Gratitude & happiness', c: { base: '#FBD54A', dark: '#D9A818', light: '#FFF2B3' } },
    { id: 'pw', type: 'peony', name: 'White Peony', meaning: 'Bashful beauty & honour', c: { base: '#FFF8F2', dark: '#E2CFC4', light: '#FFFFFF' } },
    { id: 'cw', type: 'carnation', name: 'White Carnation', meaning: 'Pure love & good luck', c: { base: '#FFFBF4', dark: '#DDD0BC', light: '#FFFFFF' } },
    { id: 'rw', type: 'ranunculus', name: 'White Ranunculus', meaning: 'Charm & sweetness', c: { base: '#FFF9F0', dark: '#DCCDB6', light: '#FFFFFF' } },
    { id: 'rf', type: 'ranunculus', name: 'Fuchsia Ranunculus', meaning: "You're dazzling", c: { base: '#E2457E', dark: '#B02660', light: '#F48CB1' } },
    { id: 'hk', type: 'hydrangea', name: 'Pink Hydrangea', meaning: 'Heartfelt emotion', c: { base: '#F2A7C3', dark: '#D9789E', light: '#FBD3E2' } },
    { id: 'hw', type: 'hydrangea', name: 'White Hydrangea', meaning: 'Abundance & purity', c: { base: '#F4F6EA', dark: '#C5CFB2', light: '#FFFFFF' } },
    { id: 'ok', type: 'orchid', name: 'Pink Orchid', meaning: 'Grace & joy', c: { base: '#F48FBF', dark: '#C9568C', light: '#FFD1E6', accent: '#B0306A' } },
    { id: 'gy', type: 'gerbera', name: 'Yellow Gerbera', meaning: 'Sunny cheer', c: { base: '#FFD23F', dark: '#E5AE12', light: '#FF8A3D' } },
    { id: 'gr', type: 'gerbera', name: 'Red Gerbera', meaning: 'Bold, happy love', c: { base: '#E8303F', dark: '#B51A2A', light: '#FFD24A' } },
    { id: 'pa', type: 'poppy', name: 'White Poppy', meaning: 'Peace & rest', c: { base: '#FBF7F0', dark: '#D9CFC0', light: '#FFFFFF' } },
    { id: 'sr', type: 'sunflower', name: 'Red Sunflower', meaning: 'Warm, deep devotion', c: { base: '#B8432A', dark: '#8A2A16', light: '#3F2614' } },
    { id: 'bp', type: 'babysbreath', name: "Pink Baby's Breath", meaning: 'Sweet, tender love', c: { base: '#F8D3DF', dark: '#E3A9BC', light: '#FFF0F5' } },
    // ---- new kinds
    { id: 'lt', type: 'lotus', name: 'Pink Lotus', meaning: 'Rising, beautifully, through anything', c: { base: '#F6B3CB', dark: '#E07AA0', light: '#FFE6EF', tip: '#D4567F' } },
    { id: 'lu', type: 'lotus', name: 'White Lotus', meaning: 'Purity & peace of mind', c: { base: '#FFFBF5', dark: '#E6D8CC', light: '#FFFFFF', tip: '#F2C6D3' } },
    { id: 'lx', type: 'lotus', name: 'Blue Lotus', meaning: 'Wisdom & serenity', c: { base: '#9DB6EE', dark: '#6B88D2', light: '#DCE6FB', tip: '#4C68B8' } },
    { id: 'ka', type: 'calla', name: 'White Calla Lily', meaning: 'Magnificent beauty', c: { base: '#FBF8F0', dark: '#D8CDB8', light: '#FFFFFF' } },
    { id: 'kb', type: 'calla', name: 'Burgundy Calla Lily', meaning: 'Passion & mystery', c: { base: '#7A1F3D', dark: '#4E1027', light: '#B0507A' } },
    { id: 'ky', type: 'calla', name: 'Yellow Calla Lily', meaning: 'Gratitude & growth', c: { base: '#F6CF4A', dark: '#D5A41F', light: '#FFE695' } },
    { id: 'dp', type: 'dahlia', name: 'Pink Dahlia', meaning: 'Grace & kindness', c: { base: '#F08DB4', dark: '#C95A86', light: '#FFC9DE' } },
    { id: 'dw', type: 'dahlia', name: 'Café au Lait Dahlia', meaning: 'Elegance & commitment', c: { base: '#F3D9C8', dark: '#D6AE96', light: '#FFF1E8' } },
    { id: 'dc', type: 'dahlia', name: 'Coral Dahlia', meaning: 'Bright new chapters', c: { base: '#FF8C6B', dark: '#E0603F', light: '#FFC1AD' } },
    { id: 'an', type: 'anemone', name: 'White Anemone', meaning: 'Anticipation & hope', c: { base: '#FDFBF7', dark: '#D8D0C6', light: '#FFFFFF' } },
    { id: 'av', type: 'anemone', name: 'Violet Anemone', meaning: 'Looking forward to you', c: { base: '#8D63C9', dark: '#5F3C98', light: '#C2A6E8' } },
    { id: 'ib', type: 'iris', name: 'Blue Iris', meaning: 'Faith, hope & wisdom', c: { base: '#5E78D6', dark: '#3A4FA6', light: '#9DB0F0' } },
    { id: 'iw', type: 'iris', name: 'White Iris', meaning: 'Purity & a kind heart', c: { base: '#FBF8F3', dark: '#D3CABD', light: '#FFFFFF' } },
    { id: 'co', type: 'cosmos', name: 'Pink Cosmos', meaning: 'Harmony & peace', c: { base: '#F39CC0', dark: '#D26C96', light: '#FFD4E5' } },
    { id: 'cc', type: 'cosmos', name: 'Chocolate Cosmos', meaning: 'Deep, lasting love', c: { base: '#5A2430', dark: '#3A121C', light: '#8A3B4C', center: '#2A0D14' } },
    { id: 'mg', type: 'magnolia', name: 'Pink Magnolia', meaning: 'Dignity & sweet love', c: { base: '#F7CADA', dark: '#C2507B', light: '#FFF0F5' } },
    { id: 'mw', type: 'magnolia', name: 'White Magnolia', meaning: 'Nobility & perseverance', c: { base: '#FFFDF7', dark: '#D6B4C2', light: '#FFFFFF' } },
    { id: 'mo', type: 'marigold', name: 'Orange Marigold', meaning: 'Warmth & celebration', c: { base: '#F28C1B', dark: '#C9620A', light: '#FFB547' } },
    { id: 'my', type: 'marigold', name: 'Yellow Marigold', meaning: 'Joy & good fortune', c: { base: '#F7C21B', dark: '#D49A08', light: '#FFE066' } },
    { id: 'hr', type: 'hibiscus', name: 'Red Hibiscus', meaning: 'Delicate beauty', c: { base: '#E0313B', dark: '#9C1424', light: '#FF6D73' } },
    { id: 'hp', type: 'hibiscus', name: 'Pink Hibiscus', meaning: 'Friendship & affection', c: { base: '#F592B6', dark: '#C2185B', light: '#FFC6DA' } },
    { id: 'hy', type: 'hibiscus', name: 'Yellow Hibiscus', meaning: 'Happiness & sunshine', c: { base: '#F9D34A', dark: '#E0A81C', light: '#FFE98F', eye: '#C8312A' } },
    { id: 'js', type: 'jasmine', name: 'Jasmine', meaning: 'Sweet love & grace', c: { base: '#FFFFFF', dark: '#DCD6CB', light: '#F6E08A', bud: '#F3C3D3' } },
    { id: 'vl', type: 'valley', name: 'Lily of the Valley', meaning: 'Happiness returns', c: { base: '#FFFFFF', dark: '#CFD6C4', light: '#F4F7EE' } },
    { id: 'fn', type: 'fern', name: 'Fern', meaning: 'Sincerity & shelter', c: { base: '#79A862', dark: '#557F44', light: '#A5CB8C' } },
    // baby (spray) roses: a little cluster of small roses on one stem
    { id: 'sp', type: 'sprayrose', name: 'Pink Baby Roses', meaning: 'Sweet, gentle affection', c: { base: '#F5A3BC', dark: '#D26A8A', light: '#FFD6E2' } },
    { id: 'sb', type: 'sprayrose', name: 'Blue Baby Roses', meaning: 'Mystery & wonder', c: { base: '#7E9BE3', dark: '#4C68BF', light: '#BCCBF6' } },
    { id: 'sw', type: 'sprayrose', name: 'White Baby Roses', meaning: 'A new, gentle love', c: { base: '#FFF9F1', dark: '#DACBB4', light: '#FFFFFF' } },
    { id: 'sh', type: 'sprayrose', name: 'Peach Baby Roses', meaning: 'Warm little thank-yous', c: { base: '#FFBE9C', dark: '#E58E68', light: '#FFE0CF' } },
    { id: 'se', type: 'sprayrose', name: 'Red Baby Roses', meaning: 'Little love notes', c: { base: '#DC3348', dark: '#A11E32', light: '#F57A8A' } },
    { id: 'sl', type: 'sprayrose', name: 'Lilac Baby Roses', meaning: 'Enchantment', c: { base: '#C4AEE6', dark: '#9479C7', light: '#E8DDF8' } },
  ];

  // Colour groups for the colour filter (every flower is in exactly one).
  const COLORS = [
    { id: 'red', name: 'Red', sw: '#D7263D', ids: ['rr', 'cr', 'pr', 'tr', 'gr', 'hr', 'sr', 'se'] },
    { id: 'pink', name: 'Pink', sw: '#F28BA8', ids: ['rp', 'pk', 'cp', 'gp', 'sk', 'tk', 'td', 'tx', 'lp', 'rf', 'hk', 'ok', 'lt', 'dp', 'co', 'mg', 'hp', 'bp', 'sp'] },
    { id: 'peach', name: 'Peach', sw: '#FFB38A', ids: ['to', 'pc', 'rn', 'rq', 'dc', 'dw', 'sh'] },
    { id: 'orange', name: 'Orange', sw: '#FF8A3D', ids: ['po', 'go', 'tg', 'lo', 'mo'] },
    { id: 'yellow', name: 'Yellow', sw: '#F7C948', ids: ['ry', 'ty', 'sf', 'gy', 'lj', 'ky', 'my', 'hy'] },
    { id: 'white', name: 'White', sw: '#FFFDF8', ids: ['ri', 'dz', 'ly', 'bb', 'ow', 'tw', 'ts', 'pw', 'cw', 'rw', 'hw', 'pa', 'lu', 'ka', 'an', 'iw', 'mw', 'js', 'vl', 'sw'] },
    { id: 'purple', name: 'Purple', sw: '#9B6BD3', ids: ['tp', 'lv', 'hl', 'op', 'rl', 'av', 'sl'] },
    { id: 'blue', name: 'Blue', sw: '#6F8EDB', ids: ['hb', 'fm', 'rb', 'tl', 'lb', 'lx', 'ib', 'sb'] },
    { id: 'dark', name: 'Deep', sw: '#4A1E3D', ids: ['tb', 'kb', 'cc'] },
    { id: 'green', name: 'Green', sw: '#86A872', ids: ['eu', 'fn'] },
  ];

  // Flower families: one card in the catalog, with a colour dot for each member.
  const FAMILIES = [
    ['rose', 'Rose'], ['sprayrose', 'Baby Roses'], ['tulip', 'Tulip'], ['lily', 'Lily'], ['lotus', 'Lotus'], ['peony', 'Peony'], ['calla', 'Calla Lily'],
    ['dahlia', 'Dahlia'], ['hydrangea', 'Hydrangea'], ['orchid', 'Orchid'], ['ranunculus', 'Ranunculus'], ['carnation', 'Carnation'],
    ['magnolia', 'Magnolia'], ['anemone', 'Anemone'], ['iris', 'Iris'], ['hibiscus', 'Hibiscus'], ['sunflower', 'Sunflower'],
    ['gerbera', 'Gerbera'], ['daisy', 'Daisy'], ['cosmos', 'Cosmos'], ['poppy', 'Poppy'], ['marigold', 'Marigold'],
    ['sakura', 'Cherry Blossom'], ['lavender', 'Lavender'], ['jasmine', 'Jasmine'], ['valley', 'Lily of the Valley'],
    ['forgetmenot', 'Forget-me-not'], ['babysbreath', "Baby's Breath"], ['eucalyptus', 'Eucalyptus'], ['fern', 'Fern'],
  ].map(([id, name]) => ({ id, name, ids: [] }));
  const FAM_OF_TYPE = { parrot: 'tulip', doubletulip: 'tulip' };
  const SHADE = { sf: 'Golden', bb: 'White' };
  const FAMILY_ORDER = {
    rose: ['rr', 'rp', 'rq', 'ry', 'ri', 'rl', 'rb'],
    sprayrose: ['sp', 'se', 'sh', 'sw', 'sl', 'sb'],
    tulip: ['tr', 'tk', 'to', 'tg', 'ty', 'tw', 'tp', 'tl', 'tb', 'ts', 'tx', 'td'],
    lily: ['ly', 'lp', 'lo', 'lj', 'lb'],
    gerbera: ['gr', 'gp', 'go', 'gy'],
    hydrangea: ['hb', 'hl', 'hk', 'hw'],
  };

  // Mood groups for the catalog filter (every flower is in exactly one).
  const MOODS = [
    { id: 'romantic', name: 'Romantic', ids: ['rr', 'rp', 'pk', 'pc', 'cr', 'cp', 'rn', 'rq', 'tr', 'tk', 'td', 'lp', 'rf', 'hk', 'ok', 'lt', 'dp', 'cc', 'mg', 'hr', 'hp', 'gr', 'bp', 'sp', 'se', 'sh'] },
    { id: 'cheerful', name: 'Cheerful', ids: ['ry', 'ty', 'to', 'dz', 'sf', 'pr', 'po', 'go', 'gp', 'tg', 'ts', 'tx', 'lo', 'lj', 'gy', 'sr', 'ky', 'dc', 'co', 'mo', 'my', 'hy'] },
    { id: 'calm', name: 'Calm', ids: ['lv', 'sk', 'hb', 'hl', 'fm', 'rb', 'tl', 'lb', 'lx', 'ib', 'av', 'js', 'vl', 'sb', 'sl'] },
    { id: 'elegant', name: 'Elegant', ids: ['ri', 'tp', 'ly', 'op', 'ow', 'rl', 'tw', 'tb', 'pw', 'cw', 'rw', 'hw', 'pa', 'lu', 'ka', 'kb', 'dw', 'an', 'iw', 'mw', 'sw'] },
    { id: 'green', name: 'Fillers', ids: ['bb', 'eu', 'fn'] },
  ];
  const BY_ID = Object.fromEntries(CATALOG.map(f => [f.id, f]));
  MOODS.forEach(m => m.ids.forEach(id => (BY_ID[id].mood = m.id)));
  COLORS.forEach(c => c.ids.forEach(id => (BY_ID[id].color = c.id)));
  const FAM_BY_ID = Object.fromEntries(FAMILIES.map(f => [f.id, f]));
  CATALOG.forEach(f => {
    f.fam = FAM_OF_TYPE[f.type] || f.type;
    const fam = FAM_BY_ID[f.fam];
    fam.ids.push(f.id);
    // the short colour label on the family card: "Blue Lily" → "Blue", "Parrot Tulip" → "Parrot"
    f.shade = SHADE[f.id] || f.name.replace(new RegExp(`\\s*${fam.name}$`, 'i'), '').trim() || f.name;
  });
  // colour order on the cards: warm to cool, specials last
  Object.entries(FAMILY_ORDER).forEach(([fam, order]) => FAM_BY_ID[fam].ids.sort((a, b) => order.indexOf(a) - order.indexOf(b)));

  // Bouquet sizes: Posy is short and compact, Grand is tall with a third row, Lavish adds a fourth.
  const SIZES = {
    s: { id: 's', name: 'Posy', max: 7, wrap: 0.8, dome: 24, step: 7, single: 168,
         rows: [{ R: 176, max: 26, s: 1.18 }, { R: 140, max: 20, s: 1.1 }] },
    m: { id: 'm', name: 'Classic', max: 12, wrap: 1, dome: 36, step: 7.5, single: 236,
         rows: [{ R: 256, max: 34, s: 1.32 }, { R: 196, max: 28, s: 1.2 }] },
    l: { id: 'l', name: 'Grand', max: 24, wrap: 1.14, dome: 44, step: 6.5, single: 270,
         rows: [{ R: 300, max: 36, s: 1.28 }, { R: 248, max: 33, s: 1.22 }, { R: 196, max: 28, s: 1.14 }] },
    x: { id: 'x', name: 'Lavish', max: 36, wrap: 1.2, dome: 48, step: 6, single: 270,
         rows: [{ R: 296, max: 44, s: 1.15 }, { R: 256, max: 40, s: 1.11 }, { R: 216, max: 35, s: 1.06 }, { R: 178, max: 28, s: 1.02 }] },
  };
  const MAX_STEMS = 36; // keep in step with the stems check in supabase/schema.sql

  const WRAPS = {
    kraft: { name: 'Kraft', base: '#D3A877', dark: '#B4865A', light: '#EBD3B4' },
    blush: { name: 'Blush', base: '#F4C7C3', dark: '#E09C99', light: '#FBE3E0' },
    sage: { name: 'Sage', base: '#BCCDAE', dark: '#95AC86', light: '#DCE6D3' },
    cream: { name: 'Cream', base: '#F2E8D8', dark: '#D6C5A8', light: '#FBF6EC' },
    midnight: { name: 'Midnight', base: '#3A4066', dark: '#252945', light: '#5B6190' },
  };
  const RIBBONS = {
    ruby: { name: 'Ruby', base: '#C8304C', dark: '#8F1F35' },
    gold: { name: 'Gold', base: '#DDAA3E', dark: '#A87C1F' },
    ivory: { name: 'Ivory', base: '#FAF4EA', dark: '#CDBFA7' },
    lilac: { name: 'Lilac', base: '#AE92D3', dark: '#7D62A6' },
  };

  const STEM = '#5E8A4F';
  const G = { x: 200, y: 405 }; // where all stems gather

  /* ---------- flower heads (drawn around 0,0; stem tip = 0,0) ---------- */
  const rot = (d, extra = '') => `transform="rotate(${d})${extra}"`;

  const HEADS = {
    rose(c) {
      let s = `<circle r="25" fill="${c.dark}"/>`;
      const petal = 'M0,0 C-17,-5 -17,-27 0,-27 C17,-27 17,-5 0,0Z';
      for (let k = 0; k < 6; k++) s += `<path d="${petal}" fill="${c.base}" stroke="${c.dark}" stroke-width="1.2" ${rot(k * 60 + 15)}/>`;
      s += `<circle r="14" fill="${c.base}" stroke="${c.dark}" stroke-width="1.2"/>`;
      for (let k = 0; k < 3; k++) s += `<path d="${petal}" fill="${c.base}" stroke="${c.dark}" stroke-width="1" transform="rotate(${k * 120 + 40}) scale(.5)"/>`;
      s += `<path d="M1,-1 C5,-5 -1,-9 -5,-5 C-9,-1 -4,6 2,5 C8,4 9,-3 6,-8" fill="none" stroke="${c.dark}" stroke-width="1.6" stroke-linecap="round"/>`;
      s += `<ellipse cx="-9" cy="-12" rx="6" ry="3" fill="${c.light}" opacity=".55" transform="rotate(-35 -9 -12)"/>`;
      return s;
    },
    tulip(c) {
      return `<path d="M-13,8 C-19,-8 -12,-24 0,-30 C12,-24 19,-8 13,8 C6,13 -6,13 -13,8Z" fill="${c.dark}"/>
        <path d="M-15,6 C-21,-12 -12,-22 -6,-29 C-2,-16 0,-4 -1,11 C-8,13 -13,10 -15,6Z" fill="${c.base}"/>
        <path d="M15,6 C21,-12 12,-22 6,-29 C2,-16 0,-4 1,11 C8,13 13,10 15,6Z" fill="${c.base}"/>
        <path d="M-9,9 C-12,-6 -6,-20 0,-25 C6,-20 12,-6 9,9 C4,13 -4,13 -9,9Z" fill="${c.base}" stroke="${c.dark}" stroke-width=".8"/>
        <path d="M-4,4 C-6,-6 -3,-14 0,-18" fill="none" stroke="${c.light}" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>` +
        (c.flame ? `<g fill="none" stroke="${c.flame}" stroke-linecap="round" opacity=".9">
          <path d="M-13,4 C-17,-8 -12,-18 -7,-26 M-10,2 C-12,-6 -10,-12 -8,-16" stroke-width="1.6"/>
          <path d="M13,4 C17,-8 12,-18 7,-26 M10,2 C12,-6 10,-12 8,-16" stroke-width="1.6"/>
          <path d="M0,-24 C-3,-16 -2,-6 -5,6 M0,-24 C3,-16 2,-6 5,6 M0,-20 L0,8" stroke-width="1.3"/></g>` : '');
    },
    parrot(c) {
      // ruffled, feathered petals with green flames
      const L = 'M-1,11 C-8,13 -13,11 -15,7 C-22,-2 -21,-14 -15,-22 L-12,-18 L-12,-27 L-7,-21 L-5,-31 L-2,-24 C-2,-14 0,-4 -1,11Z';
      const R = 'M1,11 C8,13 13,11 15,7 C22,-2 21,-14 15,-22 L12,-18 L12,-27 L7,-21 L5,-31 L2,-24 C2,-14 0,-4 1,11Z';
      return `<path d="M-13,8 C-19,-8 -12,-24 0,-30 C12,-24 19,-8 13,8 C6,13 -6,13 -13,8Z" fill="${c.dark}"/>
        <path d="${L}" fill="${c.base}" stroke="${c.dark}" stroke-width=".7"/><path d="${R}" fill="${c.base}" stroke="${c.dark}" stroke-width=".7"/>
        <path d="M-9,10 C-12,-4 -9,-16 -6,-22 L-3,-17 L0,-29 L3,-17 L6,-22 C9,-16 12,-4 9,10 C4,13 -4,13 -9,10Z" fill="${c.light}" stroke="${c.dark}" stroke-width=".7"/>
        <path d="M-11,6 C-13,-2 -11,-8 -9,-12 M11,6 C13,-2 11,-8 9,-12 M0,8 C-1,0 1,-8 0,-16" fill="none" stroke="${c.accent}" stroke-width="2.2" stroke-linecap="round" opacity=".85"/>
        <path d="M-4,4 C-5,-4 -3,-10 -1,-14" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>`;
    },
    doubletulip(c) {
      // the peony-flowered tulip: a cup of many rounded petals
      const P = 'M0,8 C-10,6 -14,-10 -8,-20 C-4,-26 4,-26 8,-20 C14,-10 10,6 0,8Z';
      let s = `<path d="M-16,6 C-22,-8 -16,-22 0,-27 C16,-22 22,-8 16,6 C8,13 -8,13 -16,6Z" fill="${c.dark}"/>`;
      [[-9, -2, -24, 1], [9, -2, 24, 1], [-5, -6, -10, 0.86], [5, -6, 10, 0.86]].forEach(([x, y, a, k]) =>
        (s += `<path d="${P}" fill="${c.base}" stroke="${c.dark}" stroke-width=".8" transform="translate(${x},${y}) rotate(${a}) scale(${k})"/>`));
      s += `<path d="${P}" fill="${c.light}" stroke="${c.dark}" stroke-width=".8" transform="translate(0,-10) scale(.62)"/>`;
      s += `<path d="${P}" fill="${c.base}" stroke="${c.dark}" stroke-width=".8" transform="translate(0,2) scale(.9)"/>`;
      return s + `<path d="M-3,2 C-5,-6 -3,-12 0,-15" fill="none" stroke="${c.light}" stroke-width="2" stroke-linecap="round" opacity=".85"/>`;
    },
    daisy(c) {
      let s = '';
      for (let k = 0; k < 14; k++) s += `<ellipse cy="-14" rx="4.6" ry="12" fill="${c.base}" stroke="${c.dark}" stroke-width=".8" ${rot(k * 360 / 14)}/>`;
      s += `<circle r="8.5" fill="${c.light}"/><circle r="8.5" fill="none" stroke="#D9921F" stroke-width="1.2"/>`;
      for (let k = 0; k < 8; k++) s += `<circle cx="0" cy="-4.5" r="1" fill="#C77F12" ${rot(k * 45)}/>`;
      return s;
    },
    sunflower(c) {
      let s = '';
      const petal = 'M0,-9 C6,-16 5,-27 0,-33 C-5,-27 -6,-16 0,-9Z';
      for (let k = 0; k < 18; k++) s += `<path d="${petal}" fill="${c.dark}" ${rot(k * 20 + 10)}/>`;
      for (let k = 0; k < 18; k++) s += `<path d="${petal}" fill="${c.base}" ${rot(k * 20)}/>`;
      s += `<circle r="14" fill="${c.light}"/><circle r="10" fill="#7A4E26"/>`;
      [[4, 6], [8, 10], [11.5, 14]].forEach(([r, n]) => {
        for (let k = 0; k < n; k++) s += `<circle cx="0" cy="${-r}" r="1.2" fill="#3E2512" ${rot(k * 360 / n + r * 7)}/>`;
      });
      return s;
    },
    lavender(c) {
      let s = `<path d="M0,6 L0,-56" stroke="#6E8F5A" stroke-width="2" stroke-linecap="round"/>`;
      for (let i = 0; i < 10; i++) {
        const y = 2 - i * 6, k = 1 - i * 0.055, fill = i % 2 ? c.base : c.dark;
        s += `<ellipse cx="${-3.6 * k}" cy="${y}" rx="${3.8 * k}" ry="${5.4 * k}" fill="${fill}" transform="rotate(-24 ${-3.6 * k} ${y})"/>`;
        s += `<ellipse cx="${3.6 * k}" cy="${y - 3}" rx="${3.8 * k}" ry="${5.4 * k}" fill="${i % 2 ? c.dark : c.base}" transform="rotate(24 ${3.6 * k} ${y - 3})"/>`;
      }
      s += `<ellipse cx="0" cy="-60" rx="2.6" ry="4.4" fill="${c.light}"/>`;
      return s;
    },
    sakura(c) {
      const blossom = (x, y, sc, r) => {
        let s = `<g transform="translate(${x},${y}) scale(${sc}) rotate(${r})">`;
        for (let k = 0; k < 5; k++) s += `<path d="M0,0 C-10,-4 -13,-17 -6,-23 L0,-19 L6,-23 C13,-17 10,-4 0,0Z" fill="${c.base}" stroke="${c.dark}" stroke-width="1" ${rot(k * 72)}/>`;
        s += `<circle r="4" fill="${c.dark}"/>`;
        for (let k = 0; k < 6; k++) s += `<line x1="0" y1="0" x2="0" y2="-8" stroke="#D2577A" stroke-width=".9" ${rot(k * 60 + 10)}/><circle cx="0" cy="-8.5" r="1.3" fill="#C2405F" ${rot(k * 60 + 10)}/>`;
        return s + '</g>';
      };
      return `<path d="M0,10 C-4,0 -10,-4 -14,-2 M0,10 C2,0 8,-2 12,-4" stroke="#7A5440" stroke-width="2" fill="none" stroke-linecap="round"/>` +
        blossom(-12, 2, 0.62, 10) + blossom(12, 0, 0.58, -20) + blossom(0, -10, 0.78, 0) +
        `<ellipse cx="-20" cy="-14" rx="3" ry="4.5" fill="${c.dark}" transform="rotate(-30 -20 -14)"/>`;
    },
    lily(c) {
      let s = '';
      const petal = 'M0,0 C-9,-10 -7,-28 0,-36 C7,-28 9,-10 0,0Z';
      for (let k = 0; k < 3; k++) s += `<path d="${petal}" fill="${c.dark}" ${rot(k * 120 + 60)}/>`;
      for (let k = 0; k < 3; k++) s += `<path d="${petal}" fill="${c.base}" stroke="${c.dark}" stroke-width="1" ${rot(k * 120)}/><path d="M0,-3 L0,-24" stroke="${c.light}" stroke-width="2.2" stroke-linecap="round" ${rot(k * 120)}/>`;
      if (c.spots) {
        for (let k = 0; k < 6; k++) {
          [[-2.6, -9, 1], [2.4, -12, 0.9], [-2, -16, 0.8], [2.2, -19, 0.7], [-1.4, -22, 0.6]].forEach(([x, y, r]) =>
            (s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.spots}" ${rot(k * 60)}/>`));
        }
      }
      s += `<circle r="4" fill="${c.light}"/>`;
      for (let k = 0; k < 6; k++) s += `<line x1="0" y1="0" x2="0" y2="-15" stroke="#B7C483" stroke-width="1" ${rot(k * 60 + 30)}/><ellipse cx="0" cy="-16" rx="1.6" ry="3" fill="#C8692B" ${rot(k * 60 + 30)}/>`;
      return s;
    },
    babysbreath(c) {
      const pts = [[0, -18], [-12, -12], [12, -13], [-18, 0], [18, -1], [-8, -2], [8, -4], [0, 4], [-13, 10], [13, 9], [-4, -24], [6, -22], [-20, -10], [20, -12], [0, -8], [-6, 14], [7, 15]];
      let s = '';
      pts.forEach(([x, y]) => (s += `<path d="M0,10 Q${x * 0.3},${(y + 10) / 2} ${x},${y}" stroke="#8FA77F" stroke-width=".7" fill="none"/>`));
      pts.forEach(([x, y], i) => (s += `<circle cx="${x}" cy="${y}" r="${2.6 + (i % 3) * 0.5}" fill="${c.base}" stroke="${c.dark}" stroke-width=".6"/>`));
      return s;
    },
    peony(c) {
      let s = `<circle r="27" fill="${c.dark}"/>`;
      const outer = 'M0,0 C-15,-3 -17,-25 -6,-28 C-1,-30 5,-30 10,-27 C18,-22 13,-4 0,0Z';
      for (let k = 0; k < 8; k++) s += `<path d="${outer}" fill="${c.base}" stroke="${c.dark}" stroke-width=".9" ${rot(k * 45)}/>`;
      for (let k = 0; k < 7; k++) s += `<path d="${outer}" fill="${c.light}" stroke="${c.dark}" stroke-width=".8" transform="rotate(${k * 51 + 20}) scale(.72)"/>`;
      for (let k = 0; k < 6; k++) s += `<path d="${outer}" fill="${c.base}" stroke="${c.dark}" stroke-width=".8" transform="rotate(${k * 60 + 8}) scale(.46)"/>`;
      s += `<path d="M-4,-2 C-2,-6 3,-6 4,-1 C5,3 0,5 -3,3" fill="none" stroke="${c.dark}" stroke-width="1.3" stroke-linecap="round"/>`;
      return s;
    },
    carnation(c) {
      const frill = 'M0,0 L-8,-17 L-6,-21 L-3.5,-18 L-1.5,-22.5 L0.5,-18.5 L3,-22 L5,-18 L7.5,-20.5 L8,-16 Z';
      let s = '';
      for (let k = 0; k < 12; k++) s += `<path d="${frill}" fill="${c.dark}" transform="rotate(${k * 30}) scale(1.15)"/>`;
      for (let k = 0; k < 12; k++) s += `<path d="${frill}" fill="${c.base}" transform="rotate(${k * 30 + 15}) scale(.92)"/>`;
      for (let k = 0; k < 9; k++) s += `<path d="${frill}" fill="${c.light}" transform="rotate(${k * 40 + 5}) scale(.58)"/>`;
      return s + `<circle r="3" fill="${c.dark}"/>`;
    },
    ranunculus(c) {
      let s = '';
      [26, 22, 18, 14.5, 11, 8, 5].forEach((r, i) => {
        s += `<circle cy="${-(26 - r) * 0.18}" r="${r}" fill="${i % 2 ? c.light : c.base}" stroke="${c.dark}" stroke-width=".9"/>`;
      });
      return s + `<circle cy="-4.3" r="2.6" fill="#8DAA6B"/>`;
    },
    poppy(c) {
      let s = '';
      for (let k = 0; k < 4; k++) s += `<ellipse cy="-12" rx="15" ry="14" fill="${c.base}" stroke="${c.dark}" stroke-width=".9" ${rot(k * 90 + 45)}/>`;
      for (let k = 0; k < 4; k++) s += `<ellipse cy="-9" rx="11" ry="10" fill="${c.light}" opacity=".55" ${rot(k * 90)}/>`;
      for (let k = 0; k < 14; k++) s += `<circle cx="0" cy="-10" r="1.4" fill="#2E2226" ${rot(k * 360 / 14)}/>`;
      return s + `<circle r="6.5" fill="#3A2C30"/><circle r="2.5" fill="#6B8F55"/>`;
    },
    gerbera(c) {
      const petal = 'M0,-8 C3,-14 3,-24 0,-29 C-3,-24 -3,-14 0,-8Z';
      let s = '';
      for (let k = 0; k < 22; k++) s += `<path d="${petal}" fill="${c.dark}" ${rot(k * 360 / 22 + 8)}/>`;
      for (let k = 0; k < 22; k++) s += `<path d="${petal}" fill="${c.base}" transform="rotate(${k * 360 / 22}) scale(.8)"/>`;
      return s + `<circle r="9" fill="#4A3020"/><circle r="9" fill="none" stroke="${c.light}" stroke-width="2.6" stroke-dasharray="2 2.2"/><circle r="4" fill="#2E1D12"/>`;
    },
    hydrangea(c) {
      const pts = [[0, 0], [11, 0], [-11, 0], [5.5, 9.5], [-5.5, 9.5], [5.5, -9.5], [-5.5, -9.5], [16.5, -9.5], [-16.5, -9.5], [16.5, 9.5], [-16.5, 9.5], [0, -19], [11, -19], [-11, -19], [0, 19], [11, 18], [-11, 18], [22, 0], [-22, 0]];
      let s = `<circle r="26" fill="${c.dark}" opacity=".55"/>`;
      pts.forEach(([x, y], i) => {
        const col = i % 3 === 0 ? c.light : i % 3 === 1 ? c.base : c.dark;
        s += `<g transform="translate(${x},${y}) rotate(${(i * 23) % 90})">`;
        for (let k = 0; k < 4; k++) s += `<ellipse cy="-3.6" rx="3.4" ry="4.4" fill="${col}" stroke="${c.dark}" stroke-width=".4" ${rot(k * 90)}/>`;
        s += `<circle r="1.2" fill="#fff" opacity=".85"/></g>`;
      });
      return s;
    },
    forgetmenot(c) {
      const spots = [[0, 0, 1], [-12, -6, 0.85], [11, -8, 0.9], [-4, -17, 0.8], [9, 7, 0.75], [-10, 9, 0.7], [3, -27, 0.6]];
      let s = '';
      spots.forEach(([x, y]) => (s += `<path d="M0,12 Q${x * 0.4},${(y + 12) / 2} ${x},${y}" stroke="#6E8F5A" stroke-width=".9" fill="none"/>`));
      spots.forEach(([x, y, k]) => {
        s += `<g transform="translate(${x},${y}) scale(${k})">`;
        for (let p = 0; p < 5; p++) s += `<circle cy="-4" r="3.9" fill="${c.base}" stroke="${c.dark}" stroke-width=".5" ${rot(p * 72)}/>`;
        s += `<circle r="2.2" fill="#fff"/><circle r="1.3" fill="${c.light}"/></g>`;
      });
      return s;
    },
    orchid(c) {
      const lip = c.accent || c.dark;
      let s = '';
      [0, 125, 235].forEach(a => (s += `<ellipse cy="-15" rx="6" ry="16" fill="${c.light}" stroke="${c.dark}" stroke-width=".7" ${rot(a)}/>`));
      s += `<ellipse cx="-12" cy="-5" rx="12" ry="13" fill="${c.base}" stroke="${c.dark}" stroke-width=".8" transform="rotate(-28 -12 -5)"/>`;
      s += `<ellipse cx="12" cy="-5" rx="12" ry="13" fill="${c.base}" stroke="${c.dark}" stroke-width=".8" transform="rotate(28 12 -5)"/>`;
      [[-14, -6], [-10, -1], [14, -6], [10, -1], [-16, -1], [16, -1]].forEach(([x, y]) => (s += `<circle cx="${x}" cy="${y}" r="1.1" fill="${lip}" opacity=".55"/>`));
      s += `<path d="M-7,3 C-11,13 -5,21 0,21 C5,21 11,13 7,3 C4,7 -4,7 -7,3Z" fill="${lip}"/>`;
      return s + `<ellipse cy="-1" rx="3" ry="4.2" fill="#fff"/><circle cy="-2" r="1.2" fill="#F7C948"/>`;
    },
    eucalyptus(c) {
      let s = `<path d="M0,6 L0,-58" stroke="#6F8C78" stroke-width="2" stroke-linecap="round"/>`;
      for (let i = 0; i < 7; i++) {
        const y = -2 - i * 8.5, k = 1 - i * 0.07;
        s += `<circle cx="${-6.5 * k}" cy="${y}" r="${5.6 * k}" fill="${i % 2 ? c.base : c.dark}" stroke="${c.light}" stroke-width=".5"/>`;
        s += `<circle cx="${6.5 * k}" cy="${y - 4}" r="${5.6 * k}" fill="${i % 2 ? c.dark : c.base}" stroke="${c.light}" stroke-width=".5"/>`;
      }
      return s;
    },
    lotus(c) {
      // a fan of pointed petals rising from the base, tips blushed deeper
      const P = 'M0,0 C-9,-7 -11,-24 0,-36 C11,-24 9,-7 0,0Z';
      const tip = 'M0,-25 C-4,-28 -4,-32 0,-36 C4,-32 4,-28 0,-25Z';
      const petal = (a, sx, sy, fill) =>
        `<g transform="rotate(${a}) scale(${sx},${sy})"><path d="${P}" fill="${fill}" stroke="${c.dark}" stroke-width=".8"/>` +
        `<path d="${tip}" fill="${c.tip}" opacity=".55"/><path d="M0,-4 C-1,-14 -1,-22 0,-30" fill="none" stroke="${c.light}" stroke-width="1.4" stroke-linecap="round" opacity=".8"/></g>`;
      let s = '';
      [-80, 80, -60, 60].forEach(a => (s += petal(a, 0.84, 0.78, c.dark)));
      [-40, 40, -22, 22].forEach(a => (s += petal(a, 0.95, 0.95, c.base)));
      s += `<ellipse cy="-15" rx="8" ry="4" fill="#F2C94C"/><ellipse cy="-16" rx="5.5" ry="2.4" fill="#C9A227"/>`;
      for (let k = -2; k <= 2; k++) s += `<line x1="${k * 3}" y1="-14" x2="${k * 3.6}" y2="-20" stroke="#E8B53A" stroke-width="1.1" stroke-linecap="round"/>`;
      s += petal(-11, 0.9, 0.86, c.base) + petal(11, 0.9, 0.86, c.base) + petal(0, 1, 0.82, c.light);
      return s + `<path d="M-10,3 C-6,7 6,7 10,3 C6,0 -6,0 -10,3Z" fill="#7FA36B"/>`;
    },
    calla(c) {
      // a single swirled trumpet with a golden spadix
      return `<path d="M-3,8 C-4,2 4,2 3,8Z" fill="#6E9A58"/>
        <path d="M0,6 C-12,0 -15,-20 -7,-34 C-3,-40 8,-43 15,-38 C9,-34 6,-26 9,-16 C11,-6 6,2 0,6Z" fill="${c.base}" stroke="${c.dark}" stroke-width="1"/>
        <path d="M-1,2 C-8,-6 -8,-22 -2,-32 C2,-37 7,-38 11,-37 C5,-31 3,-21 5,-12 C6,-4 3,1 -1,2Z" fill="${c.dark}" opacity=".32"/>
        <path d="M1,1 C2,-7 3,-15 2,-23" fill="none" stroke="#F2C14E" stroke-width="3.4" stroke-linecap="round"/>
        <path d="M-7,-34 C-1,-39 8,-42 15,-38" fill="none" stroke="${c.light}" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>
        <path d="M-10,-12 C-11,-20 -8,-27 -5,-31" fill="none" stroke="${c.light}" stroke-width="1.8" stroke-linecap="round" opacity=".6"/>`;
    },
    dahlia(c) {
      // rings of pointed petals, packed tighter towards the centre
      const P = 'M0,0 C-5,-6 -5,-20 0,-27 C5,-20 5,-6 0,0Z';
      let s = '';
      [[16, 1, c.dark], [14, 0.82, c.base], [12, 0.64, c.light], [10, 0.47, c.base], [8, 0.3, c.dark]].forEach(([n, k, fill], ring) => {
        for (let i = 0; i < n; i++) s += `<path d="${P}" fill="${fill}" stroke="${c.dark}" stroke-width=".6" transform="rotate(${i * 360 / n + ring * 9}) scale(${k})"/>`;
      });
      return s + `<circle r="2.4" fill="${c.dark}"/>`;
    },
    anemone(c) {
      const P = 'M0,-2 C-12,-6 -15,-24 0,-27 C15,-24 12,-6 0,-2Z';
      let s = '';
      for (let k = 0; k < 6; k++) {
        s += `<path d="${P}" fill="${c.base}" stroke="${c.dark}" stroke-width=".8" ${rot(k * 60 + 30)}/>`;
        s += `<path d="M0,-6 L0,-21 M0,-9 L-4,-19 M0,-9 L4,-19" fill="none" stroke="${c.dark}" stroke-width=".5" opacity=".6" ${rot(k * 60 + 30)}/>`;
      }
      for (let k = 0; k < 20; k++) s += `<circle cx="0" cy="-11" r="1.3" fill="#2B2733" ${rot(k * 18)}/>`;
      return s + `<circle r="7.5" fill="#24212C"/><circle r="4.2" fill="#3F4A6B"/><circle cx="-1.4" cy="-1.6" r="1.4" fill="#fff" opacity=".35"/>`;
    },
    iris(c) {
      // three standards up, three bearded falls between them
      const std = 'M0,0 C-8,-6 -9,-22 0,-29 C9,-22 8,-6 0,0Z';
      const fall = 'M0,0 C-13,-5 -16,-23 -6,-30 C-2,-33 2,-33 6,-30 C16,-23 13,-5 0,0Z';
      let s = '';
      [120, 240, 0].forEach(a => (s += `<path d="${std}" fill="${c.light}" stroke="${c.dark}" stroke-width=".8" ${rot(a)}/>`));
      [60, 300, 180].forEach(a => {
        s += `<path d="${fall}" fill="${c.base}" stroke="${c.dark}" stroke-width=".8" ${rot(a)}/>`;
        s += `<path d="M0,-6 L-5,-22 M0,-6 L5,-22 M0,-6 L0,-25" fill="none" stroke="${c.dark}" stroke-width=".6" opacity=".55" ${rot(a)}/>`;
        s += `<path d="M0,-5 L0,-16" stroke="#F2C14E" stroke-width="3" stroke-linecap="round" ${rot(a)}/>`;
      });
      return s + `<circle r="3.4" fill="${c.dark}"/>`;
    },
    cosmos(c) {
      const P = 'M0,-5 C-8,-8 -10,-22 -6,-27 L-3,-24 L0,-28 L3,-24 L6,-27 C10,-22 8,-8 0,-5Z';
      let s = '';
      for (let k = 0; k < 8; k++) {
        s += `<path d="${P}" fill="${c.base}" stroke="${c.dark}" stroke-width=".7" ${rot(k * 45 + 8)}/>`;
        s += `<path d="M0,-8 L0,-22" stroke="${c.light}" stroke-width="1.2" stroke-linecap="round" opacity=".7" ${rot(k * 45 + 8)}/>`;
      }
      const ctr = c.center || '#F2C14E';
      s += `<circle r="7" fill="${ctr}"/><circle r="7" fill="none" stroke="${c.center ? c.dark : '#D99A1F'}" stroke-width="1"/>`;
      for (let k = 0; k < 10; k++) s += `<circle cx="0" cy="-4.4" r=".9" fill="${c.center ? c.light : '#B97C12'}" ${rot(k * 36)}/>`;
      return s;
    },
    magnolia(c) {
      // a cup of spoon-shaped petals, flushed at the base
      const P = 'M0,0 C-11,-4 -13,-26 -4,-34 C-1,-36 1,-36 4,-34 C13,-26 11,-4 0,0Z';
      const flush = 'M0,0 C-7,-3 -8,-11 0,-15 C8,-11 7,-3 0,0Z';
      const petal = (a, k, fill) => `<g transform="rotate(${a}) scale(${k})"><path d="${P}" fill="${fill}" stroke="${c.dark}" stroke-width=".7"/><path d="${flush}" fill="${c.dark}" opacity=".45"/></g>`;
      return petal(-46, 0.82, c.light) + petal(46, 0.82, c.light) + petal(-24, 0.96, c.base) + petal(24, 0.96, c.base) +
        petal(-8, 1, c.base) + petal(10, 0.92, c.light) +
        `<path d="M-6,4 C-3,-1 3,-1 6,4 C3,7 -3,7 -6,4Z" fill="#7A5A44"/><path d="M-2,4 L-3,7 M2,4 L3,7" stroke="#5E4434" stroke-width=".8"/>`;
    },
    marigold(c) {
      // a ruffled pompom of tiny frilled petals
      let s = `<circle r="23" fill="${c.dark}"/>`;
      [[20, 18, 5.6, c.base], [15.5, 15, 5.2, c.light], [11, 12, 4.6, c.base], [6.5, 8, 4, c.light], [2.5, 4, 3.4, c.base]].forEach(([r, n, pr, fill], ring) => {
        for (let k = 0; k < n; k++) s += `<circle cx="0" cy="${-r}" r="${pr}" fill="${fill}" stroke="${c.dark}" stroke-width=".7" ${rot(k * 360 / n + ring * 11)}/>`;
      });
      return s;
    },
    hibiscus(c) {
      const P = 'M0,0 C-14,-4 -21,-22 -11,-30 C-6,-34 5,-35 11,-30 C21,-22 14,-4 0,0Z';
      let s = '';
      for (let k = 0; k < 5; k++) {
        s += `<path d="${P}" fill="${c.base}" stroke="${c.dark}" stroke-width=".8" ${rot(k * 72)}/>`;
        s += `<path d="M0,-3 L0,-26 M0,-6 L-7,-22 M0,-6 L7,-22" fill="none" stroke="${c.dark}" stroke-width=".5" opacity=".45" ${rot(k * 72)}/>`;
        s += `<path d="M-6,-27 C-2,-30 3,-30 7,-27" fill="none" stroke="${c.light}" stroke-width="1.6" stroke-linecap="round" opacity=".8" ${rot(k * 72)}/>`;
      }
      const eye = c.eye || c.dark;
      s += `<circle r="9" fill="${eye}" opacity=".9"/>`;
      s += `<path d="M0,0 L11,-27" stroke="${eye}" stroke-width="2.4" stroke-linecap="round"/>`;
      [[7, -18], [8.5, -21], [6, -22], [9.5, -24], [8, -25.5]].forEach(([x, y]) => (s += `<circle cx="${x}" cy="${y}" r="1.4" fill="#F6D04D"/>`));
      [[10, -29], [12.5, -28.5], [11, -31]].forEach(([x, y]) => (s += `<circle cx="${x}" cy="${y}" r="1.3" fill="${c.dark}"/>`));
      return s;
    },
    jasmine(c) {
      // a cluster of white five-point stars with a couple of pink buds
      const spots = [[0, -4, 1], [-12, -10, 0.85], [11, -12, 0.9], [-3, -21, 0.8], [10, 2, 0.72], [-11, 4, 0.7]];
      const star = 'M0,-1.5 C-3,-4 -3.4,-9 0,-11.5 C3.4,-9 3,-4 0,-1.5Z';
      let s = '';
      spots.concat([[4, -29, 0], [-17, -20, 0]]).forEach(([x, y]) => (s += `<path d="M0,12 Q${x * 0.4},${(y + 12) / 2} ${x},${y}" stroke="#6E8F5A" stroke-width=".9" fill="none"/>`));
      [[4, -29, -20], [-17, -20, 30]].forEach(([x, y, a]) => (s += `<ellipse cx="${x}" cy="${y}" rx="2.4" ry="5" fill="${c.bud}" transform="rotate(${a} ${x} ${y})"/>`));
      spots.forEach(([x, y, k], i) => {
        s += `<g transform="translate(${x},${y}) scale(${k}) rotate(${i * 17})">`;
        for (let p = 0; p < 5; p++) s += `<path d="${star}" fill="${c.base}" stroke="${c.dark}" stroke-width=".6" ${rot(p * 72)}/>`;
        s += `<circle r="1.8" fill="${c.light}"/></g>`;
      });
      return s;
    },
    valley(c) {
      // an arching stem of little hanging bells in front of a broad leaf
      let s = `<path d="M-4,8 C-19,-8 -15,-36 -7,-48 C-3,-31 2,-11 -4,8Z" fill="#7FA36B"/><path d="M-4,6 C-7,-12 -7,-30 -7,-44" stroke="#5E8A4F" stroke-width=".8" fill="none"/>`;
      s += `<path d="M0,6 C1,-12 9,-30 22,-38" stroke="#6E9A58" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
      const bell = 'M-4,0 C-4.5,-6 4.5,-6 4,0 C4,3 3.5,4.5 4.6,6 L2,5.2 L0,7 L-2,5.2 L-4.6,6 C-3.5,4.5 -4,3 -4,0Z';
      [[1.6, -8, 1.05], [4.4, -17, 1], [9, -25, 0.92], [14.6, -31.5, 0.82], [20, -36, 0.7]].forEach(([x, y, k]) => {
        s += `<path d="M${x},${y} Q${x + 2},${y + 2} ${x + 2.5},${y + 5}" stroke="#6E9A58" stroke-width=".9" fill="none"/>`;
        s += `<path d="${bell}" fill="${c.base}" stroke="${c.dark}" stroke-width=".7" transform="translate(${x + 2.5},${y + 8}) scale(${k})"/>`;
      });
      return s;
    },
    sprayrose(c) {
      // four little roses and a bud on short branches, with two leaves
      const mini = (x, y, k, r) => {
        const petal = 'M0,0 C-17,-5 -17,-27 0,-27 C17,-27 17,-5 0,0Z';
        let s = `<g transform="translate(${x},${y}) scale(${k}) rotate(${r})"><circle r="24" fill="${c.dark}"/>`;
        for (let i = 0; i < 5; i++) s += `<path d="${petal}" fill="${c.base}" stroke="${c.dark}" stroke-width="1.4" ${rot(i * 72 + 10)}/>`;
        s += `<circle r="13" fill="${c.base}" stroke="${c.dark}" stroke-width="1.4"/>`;
        s += `<path d="M1,-1 C5,-5 -1,-9 -5,-5 C-9,-1 -4,6 2,5 C8,4 9,-3 6,-8" fill="none" stroke="${c.dark}" stroke-width="2" stroke-linecap="round"/>`;
        return s + `<ellipse cx="-8" cy="-11" rx="6" ry="3" fill="${c.light}" opacity=".6" transform="rotate(-35 -8 -11)"/></g>`;
      };
      let s = `<path d="M0,12 C-2,2 -8,-4 -13,-6 M0,12 C1,0 6,-6 13,-8 M0,12 C0,0 0,-10 0,-16 M0,12 C3,6 9,2 14,4 M0,12 C-4,2 -16,-16 -18,-20" stroke="#5E8A4F" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M-2,6 C-12,2 -20,6 -22,12 C-14,14 -6,12 -2,6Z" fill="#86A872"/><path d="M2,8 C12,6 18,10 20,16 C12,17 5,14 2,8Z" fill="#7C9E68"/>`;
      s += `<path d="M-18,-20 C-22,-26 -18,-32 -15,-33 C-12,-30 -13,-24 -18,-20Z" fill="${c.base}" stroke="${c.dark}" stroke-width=".8"/>`;
      return s + mini(-13, -8, 0.4, -10) + mini(13, -9, 0.42, 20) + mini(14, 4, 0.32, 40) + mini(0, -18, 0.46, 5);
    },
    fern(c) {
      let s = `<path d="M0,6 C1,-20 -1,-44 3,-64 C5,-70 1,-73 -2,-70" stroke="${c.dark}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
      for (let i = 0; i < 11; i++) {
        const y = -2 - i * 5.8, L = 15 * (1 - i * 0.075);
        s += `<ellipse cx="${-L / 2}" cy="${y}" rx="${L / 2}" ry="2.3" fill="${i % 2 ? c.base : c.dark}" transform="rotate(-24 0 ${y})"/>`;
        s += `<ellipse cx="${L / 2}" cy="${y - 2.5}" rx="${L / 2}" ry="2.3" fill="${i % 2 ? c.dark : c.base}" transform="rotate(24 0 ${y - 2.5})"/>`;
      }
      return s + `<path d="M-1,-40 C-4,-46 -2,-52 1,-56" stroke="${c.light}" stroke-width=".8" fill="none" opacity=".7"/>`;
    },
  };

  const TYPE_SCALE = { sunflower: 1.12, lily: 1.08, babysbreath: 1.05, peony: 1.12, hydrangea: 1.06, gerbera: 1.04, lotus: 1.1, dahlia: 1.1, magnolia: 1.04, hibiscus: 1.06, doubletulip: 1.06, parrot: 1.04 };
  const THUMB_VB = {
    lavender: '-30 -66 60 76', eucalyptus: '-30 -66 60 76', tulip: '-28 -36 56 52', sakura: '-30 -32 60 50',
    babysbreath: '-26 -30 52 48', sprayrose: '-30 -38 60 56', forgetmenot: '-24 -36 48 52', orchid: '-30 -34 60 60',
    parrot: '-28 -38 56 54', doubletulip: '-28 -34 56 50', lotus: '-36 -38 72 46', calla: '-24 -46 48 56',
    magnolia: '-30 -38 60 46', jasmine: '-26 -36 52 52', valley: '-24 -52 52 62', fern: '-30 -76 60 84',
  };
  // heads that follow the stem direction instead of turning to face the viewer
  const UPRIGHT = { tulip: 1, lavender: 1, eucalyptus: 1, parrot: 1, doubletulip: 1, lotus: 1, calla: 1, magnolia: 1, valley: 1, fern: 1 };

  function headThumb(id) {
    const f = BY_ID[id];
    return `<svg viewBox="${THUMB_VB[f.type] || '-36 -36 72 72'}" aria-hidden="true" focusable="false">${HEADS[f.type](f.c)}</svg>`;
  }

  /* ---------- layout ---------- */
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Stems are dealt round-robin into rows (tallest first); heads sit on a dome.
  // Small bouquets use fewer rows: one up to 3 stems, two up to 8, three up to 16, then all of them.
  function layout(ids, seed, size) {
    const Z = SIZES[size] || SIZES.m;
    const n = ids.length, out = new Array(n), r = rng(seed || 1);
    const all = ids.map((_, i) => i);
    const k = Math.min(Z.rows.length, n <= 3 ? 1 : n <= 8 ? 2 : n <= 16 ? 3 : 4);
    const rows = Array.from({ length: k }, (_, row) => all.filter(i => i % k === row));
    rows.forEach((idxs, row) => {
      const m = idxs.length, c = k === 1 ? { ...Z.rows[0], R: Z.single } : Z.rows[row];
      const half = Math.min(c.max, Z.step * (m - 1));
      idxs.forEach((idx, j) => {
        const t = m > 1 ? (j / (m - 1)) * 2 - 1 : 0;
        const type = BY_ID[ids[idx]].type;
        out[idx] = {
          a: t * half + (r() - 0.5) * 5,
          r: c.R - t * t * Z.dome + (r() - 0.5) * 12,
          s: c.s * (TYPE_SCALE[type] || 1) * (0.95 + r() * 0.1),
          row,
          leaf: idx % 3 === 1 ? (r() < 0.5 ? -1 : 1) : 0,
        };
      });
    });
    return out;
  }

  function drawOrder(pos) {
    return pos.map((_, i) => i).sort((i, j) => pos[i].row - pos[j].row || Math.abs(pos[j].a) - Math.abs(pos[i].a));
  }

  const n1 = v => Math.round(v * 10) / 10;
  function headTransform(id, p) {
    const type = BY_ID[id].type;
    const tilt = UPRIGHT[type] ? 0 : type === 'lily' || type === 'orchid' ? -p.a * 0.3 : -p.a * 0.55;
    return `translate(0px,${n1(-p.r)}px) rotate(${n1(tilt)}deg) scale(${n1(p.s * 100) / 100})`;
  }
  const groupTransform = p => `translate(${G.x}px,${G.y}px) rotate(${n1(p.a)}deg)`;

  function stemMarkup(id, p, o = {}) {
    const f = BY_ID[id];
    const leaf = p.leaf
      ? `<path class="leaf" d="M0,0 C7,-9 19,-11 28,-5 C19,1 8,4 0,0Z" fill="#86A872" stroke="${STEM}" stroke-width=".8" style="transform:translate(0px,${n1(-p.r * 0.42)}px) scale(${p.leaf},1)"/>`
      : '';
    return `<g class="sg${o.animate ? ' enter' : ''}" data-uid="${o.uid || ''}" style="transform:${groupTransform(p)};--len:${n1(p.r)};--d:${(o.delay || 0).toFixed(2)}s;--bd:${(4 + ((p.a * 7) % 2 + 2) % 2).toFixed(2)}s">` +
      `<path class="stem" d="M0,0 Q6,-150 0,-300" fill="none" stroke="${STEM}" stroke-width="3" stroke-linecap="round" style="stroke-dasharray:${n1(p.r)} 1000"/>` +
      leaf +
      `<g class="head" style="transform:${headTransform(id, p)}"><g class="bloom">${HEADS[f.type](f.c)}</g></g></g>`;
  }

  function applyPos(g, id, p) {
    g.style.transform = groupTransform(p);
    g.style.setProperty('--len', n1(p.r));
    g.querySelector('.stem').style.strokeDasharray = `${n1(p.r)} 1000`;
    g.querySelector('.head').style.transform = headTransform(id, p);
    const leaf = g.querySelector('.leaf');
    if (leaf) leaf.style.transform = leaf.style.transform.replace(/translate\([^)]*\)/, `translate(0px,${n1(-p.r * 0.42)}px)`);
  }

  /* ---------- wrap, greenery, ribbon ---------- */
  function greens() {
    const sprig = (a, len, d) => {
      let s = `<g style="transform:translate(${G.x}px,${G.y}px) rotate(${a}deg)"><g class="sprig-in" style="--d:${d}s"><path d="M0,0 Q5,${-len / 2} 0,${-len}" stroke="#7E9C86" stroke-width="2.2" fill="none"/>`;
      for (let y = 70, i = 0; y < len; y += 22, i++) {
        const x = i % 2 ? 9 : -9;
        s += `<ellipse cx="${x}" cy="${-y}" rx="8.5" ry="6.5" fill="${i % 3 ? '#9DB8A4' : '#88A692'}" transform="rotate(${x > 0 ? 20 : -20} ${x} ${-y})"/>`;
      }
      return s + '</g></g>';
    };
    return `<g class="greens">${sprig(-42, 225, 0.2)}${sprig(41, 215, 0.3)}${sprig(14, 262, 0.25)}${sprig(-18, 250, 0.35)}</g>`;
  }

  const wrapBack = w =>
    `<g class="wrap-back"><path data-tone="dark" d="M54,232 Q200,176 346,232 L236,448 L164,448 Z" style="fill:${w.dark}"/>` +
    `<path data-tone="light" d="M86,236 Q200,200 314,236 L230,440 L170,440 Z" style="fill:${w.light}" opacity=".7"/></g>`;

  const wrapFront = w =>
    `<g class="wrap-front"><path data-tone="base" d="M70,262 L200,342 L330,262 L236,466 L164,466 Z" style="fill:${w.base}"/>` +
    `<path d="M70,262 L200,342 L164,466 Z" fill="#000" opacity=".07"/>` +
    `<path d="M200,342 L200,466 M120,300 L178,452 M280,300 L222,452" stroke="#000" stroke-opacity=".06" stroke-width="1.5" fill="none"/>` +
    `<path d="M70,262 L200,342 L330,262" stroke="#fff" stroke-opacity=".35" stroke-width="2" fill="none"/></g>`;

  const ribbon = (r, delay) =>
    `<g class="ribbon"><g class="ribbon-in" style="--d:${delay.toFixed(2)}s">` +
    `<path data-tone="base" d="M196,414 L176,458 L186,453 L190,463 L203,418Z" style="fill:${r.base}"/>` +
    `<path data-tone="base" d="M204,414 L224,458 L214,453 L210,463 L197,418Z" style="fill:${r.base}"/>` +
    `<path data-tone="base" d="M200,410 C184,390 158,394 163,410 C168,426 188,422 200,410Z" style="fill:${r.base}"/>` +
    `<path data-tone="base" d="M200,410 C216,390 242,394 237,410 C232,426 212,422 200,410Z" style="fill:${r.base}"/>` +
    `<path data-tone="dark" d="M200,410 C190,402 176,400 172,407 M200,410 C210,402 224,400 228,407" style="stroke:${r.dark}" stroke-width="1.5" fill="none"/>` +
    `<ellipse data-tone="dark" cx="200" cy="411" rx="6.5" ry="5.5" style="fill:${r.dark}"/></g></g>`;

  // The paper, greenery and ribbon scale around the gathering point with the bouquet size.
  const scaleStyle = size => {
    const k = (SIZES[size] || SIZES.m).wrap;
    return `transform:translate(${G.x}px,${G.y}px) scale(${k}) translate(${-G.x}px,${-G.y}px)`;
  };
  const VIEWBOX = '5 25 390 460';

  function bouquetSVG(ids, o = {}) {
    const w = WRAPS[o.w] || WRAPS.kraft, rb = RIBBONS[o.r] || RIBBONS.ruby;
    const pos = layout(ids, o.seed, o.size);
    const order = drawOrder(pos);
    const step = ids.length > 14 ? 0.08 : 0.13;
    const start = o.delay || 0.35;
    let stems = '';
    order.forEach((idx, k) => (stems += stemMarkup(ids[idx], pos[idx], { animate: o.animate, delay: start + k * step })));
    const sc = scaleStyle(o.size);
    const inner = `<g class="scale-group" style="${sc}">${greens()}${wrapBack(w)}</g>` + `<g class="stems">${stems}</g>` +
      `<g class="scale-group" style="${sc}">${wrapFront(w)}${ribbon(rb, start + ids.length * step + 0.5)}</g>`;
    if (!o.standalone) return inner;
    const W = o.width || 780;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" width="${W}" height="${Math.round(W * 460 / 390)}">${inner}</svg>`;
  }

  function skeleton(wKey, rKey, size) {
    const sc = scaleStyle(size);
    return `<g class="scale-group" style="${sc}">${greens()}${wrapBack(WRAPS[wKey])}</g><g class="stems"></g>` +
      `<g class="scale-group" style="${sc}">${wrapFront(WRAPS[wKey])}${ribbon(RIBBONS[rKey], 0.6)}</g>`;
  }

  function setSize(svg, size) {
    const sc = scaleStyle(size).replace('transform:', '');
    svg.querySelectorAll('.scale-group').forEach(g => (g.style.transform = sc));
  }

  function recolor(svg, wKey, rKey) {
    const w = WRAPS[wKey], r = RIBBONS[rKey];
    svg.querySelectorAll('.wrap-back [data-tone], .wrap-front [data-tone]').forEach(el => (el.style.fill = w[el.dataset.tone]));
    svg.querySelectorAll('.ribbon [data-tone]').forEach(el => {
      if (el.tagName === 'path' && el.style.stroke) el.style.stroke = r[el.dataset.tone];
      else el.style.fill = r[el.dataset.tone];
    });
  }

  window.Flora = {
    CATALOG, BY_ID, FAMILIES, FAM_BY_ID, MOODS, COLORS, SIZES, G, MAX_STEMS, WRAPS, RIBBONS, HEADS, VIEWBOX,
    headThumb, layout, drawOrder, stemMarkup, applyPos, bouquetSVG, skeleton, setSize, recolor,
  };
})();

// Independent economy configuration. Edit prices, yields and locations without changing rendering or story.
const propertyDefs=[
 {id:'warehouse',name:'BLACKWELL WAREHOUSE',x:1650,y:620,color:'#a5ef69',price:1100,upgrade:700,desc:'Produces GPU each mission. Jensen collects a licensing fee.',base:{gpu:24,cash:-45},bonus:{gpu:16,cash:-20}},
 {id:'lab',name:'RESEARCH LAB',x:1000,y:2600,color:'#a87cff',price:850,upgrade:600,desc:'Turns compute into benchmark hype.',base:{gpu:-12,hype:17},bonus:{gpu:-8,hype:14}},
 {id:'cloud',name:'CLOUD DATA CENTER',x:3330,y:620,color:'#5adce8',price:1450,upgrade:850,desc:'Converts compute into recurring cloud revenue.',base:{gpu:-16,cash:480},bonus:{gpu:-12,cash:300}}
];

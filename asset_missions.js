// Property side missions are independent of the main campaign and rendering.
// Each mission is a sequence of physical waypoints, not an instant payout.
const assetMissions = {
 warehouse: {title:'THE CUDA CARTEL',intro:'Rival couriers intercepted your GPU shipment. Recover the crate at NVIDIA and race it home.',time:195, reward:{cash:520,gpu:35,hype:4},steps:[
  {x:1880,y:950,label:'RECOVER THE BLACKWELL CRATE',line:'JENSEN: Alice, tell them the theft is not covered by warranty.'},
  {x:3650,y:1660,label:'SHAKE THE CORPORATE TAIL',line:'DARIO: Why does the rival van have a venture capital logo?'},
  {x:780,y:2720,label:'DELIVER TO YOUR WAREHOUSE',line:'ALICE: Shipment confirmed. Jensen has invoiced the chase sequence.'}]},
 lab: {title:'BENCHMARK BANDITS',intro:'Three stolen evaluation keys are scattered across the city. Retrieve them before the launch livestream.',time:220,reward:{cash:310,gpu:18,hype:24,safety:5},steps:[
  {x:2960,y:950,label:'RECOVER THE LEAKED EVAL KEY',line:'SAM: That file was called FINAL_FINAL_v23 for a reason.'},
  {x:920,y:2100,label:'VERIFY THE R1 BASELINE',line:'LIANG: The model is smaller. The spreadsheet is not.'},
  {x:1650,y:620,label:'PUBLISH AT YOUR RESEARCH LAB',line:'DARIO: Great. Our benchmark now has an actual methodology.'}]},
 cloud: {title:'COOLING CRISIS',intro:'Your data center is overheating. Collect emergency parts and restart cooling before the GPUs melt.',time:190,reward:{cash:690,gpu:12,safety:9},steps:[
  {x:2050,y:2100,label:'COLLECT EMERGENCY COOLING PARTS',line:'SUNDAR: The coolant request has passed committee 16 of 17.'},
  {x:4260,y:2740,label:'RETRIEVE THE BACKUP POWER MODULE',line:'ELON: It was designed for Mars. Your warranty is void on Earth.'},
  {x:3330,y:620,label:'RESTART THE CLOUD DATA CENTER',line:'DARIO: We have achieved artificial general refrigeration.'}]}
};

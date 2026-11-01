export type Role = '工程管理' | '造价审计' | '资料查阅' | '超管'
export const roles: Role[] = ['工程管理','造价审计','资料查阅','超管']
export interface Attachment { id:string; name:string; category:string; blobKey?:string }
export interface Contract { id:string; name:string }
export interface Project { id:string; name:string; company:string; sector:string; category:string; manager:string; auditor:string; status:string; budget:number; archived:boolean; contracts:Contract[]; files:Attachment[] }
export interface Request { id:string; projectId:string; contractId:string; type:string; status:string; stage:string; opinion:string; files:Attachment[]; results:Attachment[]; history:string[]; deleted:boolean; author:string; auditor:string; reviewer:string }
export interface Document { id:string; title:string; category:string; region:string; month:string; version:string; summary:string; file?:Attachment; published:boolean }
export const manager='陈明', auditor='林岚', reviewer='周宁'
export function canManage(role:Role){return role==='工程管理'||role==='超管'}
export function canAudit(role:Role){return role==='造价审计'||role==='超管'}
export function visibleProjects(projects:Project[],role:Role,person:string){return projects.filter(p=>role==='超管'||role==='资料查阅'||(role==='工程管理'?p.manager===person:p.auditor===person||p.contracts.some(c=>c.name.includes(person))))}
export function transition(r:Request,action:string,role:Role,person:string,note=''){
 const audit=canAudit(role)&&(role==='超管'||person===r.auditor||person===r.reviewer)
 const owner=canManage(role)&&(role==='超管'||person===r.author)
 const requireNote=()=>{if(!note.trim())throw new Error('请填写理由或意见')}
 if(action==='签收'){if(!audit||person===r.reviewer&&role!=='超管'||r.status!=='已上报')throw new Error('仅指定初审人可签收已上报资料');r.status='已签收';r.stage='待审核'}
 else if(action==='退回'){if(!audit||!['已上报','待复审'].includes(r.status)||r.status==='待复审'&&person!==r.reviewer&&role!=='超管')throw new Error('当前不可退回');requireNote();r.status=r.status==='待复审'?'复审退回':'已退回';r.stage='待审核'}
 else if(action==='下载资料'){if(!audit||person===r.reviewer&&role!=='超管'||!['已签收','审核中','复审退回'].includes(r.status))throw new Error('请先由初审人签收');r.status='审核中'}
 else if(action==='提交成果'){if(!audit||person===r.reviewer&&role!=='超管'||!['审核中','复审退回'].includes(r.status))throw new Error('仅初审人可提交成果');if(!r.results.length)throw new Error('请先上传审计成果');r.status='待复审';r.stage='已审核'}
 else if(action==='复审通过'){if(!audit||r.status!=='待复审'||person!==r.reviewer&&role!=='超管')throw new Error('仅指定复审人可操作');r.status='已完成';r.stage='已审核'}
 else if(action==='撤回'||action==='删除'){if(!owner)throw new Error('仅报送人或超管可操作');requireNote();r.status='已撤回';r.stage='待审核';if(action==='删除')r.deleted=true}
 else if(action==='重新上报'){if(!owner||!['已退回','已撤回'].includes(r.status))throw new Error('先撤回或退回再修改上报');r.status='已上报';r.stage='待审核'}
 else throw new Error('未知操作')
 r.opinion=note;r.history.push(`${new Date().toLocaleString()} ${person} ${action}${note?'：'+note:''}`)
}
export function seed(){return {
 projects:[{id:'XM-2026-001',name:'滨江产业园一期建设工程',company:'示例项目公司',sector:'协鑫科技',category:'新建',manager,auditor,status:'在建',budget:15000000,archived:false,contracts:[{id:'HT-001',name:'土建施工合同'},{id:'HT-002',name:'机电安装合同'}],files:[{id:'sample',name:'项目概况示例.txt',category:'项目资料'}]},{id:'XM-2026-002',name:'能源站设备改造',company:'示例能源公司',sector:'协鑫能科',category:'技改',manager,auditor,status:'已结束',budget:8000000,archived:true,contracts:[{id:'HT-003',name:'设备改造合同'}],files:[]} ] as Project[],
 requests:[{id:'BS-001',projectId:'XM-2026-001',contractId:'HT-001',type:'进度款上报',status:'已上报',stage:'待审核',opinion:'',files:[{id:'s1',name:'进度款资料示例.txt',category:'进度款'}],results:[],history:['工程管理 陈明 提交首期进度款'],deleted:false,author:manager,auditor,reviewer}] as Request[],
 documents:[{id:'ZD-001',title:'工程审计管理制度（合成示例）',category:'制度',region:'集团',month:'2026-11',version:'V1.0',summary:'示例：审计成果需经初审、复审后反馈工程管理人员；本条仅用于演示，不代表集团真实制度。',published:true},{id:'JG-001',title:'江苏2026年10月信息价（合成示例）',category:'造价信息',region:'江苏',month:'2026-10',version:'V1.0',summary:'示例钢筋 HRB400：3800元/吨，含税；仅为合成演示数据，不作为计价依据。',published:true},{id:'HTFB-001',title:'施工合同范本（合成示例）',category:'合同',region:'集团',month:'2026-11',version:'V1.0',summary:'合成合同范本：合同范围、金额、付款条款与变更约定。',published:true},{id:'HB-001',title:'工程资料汇编（合成示例）',category:'汇编',region:'集团',month:'2026-11',version:'V1.0',summary:'合成资料归档目录与分类说明。',published:true}] as Document[]}}

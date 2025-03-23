export interface SkillModel {
    name: string;
    level: number;
    experience: number;
    maxExperience: number;
}

export interface SkillsModel {
    running: SkillModel;
    unarmed: SkillModel;
    axe: SkillModel;
    throwing: SkillModel;
    bow: SkillModel;
    club: SkillModel;
    summoningMagic: SkillModel;
    elementalMagic: SkillModel;
    shammanMagic: SkillModel;
    natureMagic: SkillModel;
}
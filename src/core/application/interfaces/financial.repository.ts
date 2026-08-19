export interface IFinancialRepository {
  getStudentPlan(studentId: string): Promise<{ plan_name: string | null } | null>;
  updatePlanStatusAndExpireDate(studentId: string, status: string, expireDate: string): Promise<void>;
  updatePlanStatus(studentId: string, status: string): Promise<void>;
}

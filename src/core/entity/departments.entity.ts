import { BaseEntity } from 'src/common/database';
import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';

@Entity({ name: 'departments' })
export class Department extends BaseEntity {
  @Column({ unique: true })
  department_name: string;

  @Column({ default: false })
  is_active: boolean;

  @Column({ nullable: true })
  parent_name: string;

  @ManyToOne(() => Department, (department) => department.child_departments, {
    onDelete: 'CASCADE',
  })
  parent_department: Department;

  @OneToMany(() => Department, (department) => department.parent_department)
  child_departments: Department[];
}

import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/database';
import { Department } from './departments.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column()
  telegram_id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @ManyToOne(() => Department, (department) => department.users, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  department: Department;
}

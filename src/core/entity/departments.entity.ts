import { BaseEntity } from 'src/common/database';
import { Entity, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'departments' })
export class Department extends BaseEntity {
  @Column()
  department_name: string;

  @Column({ default: false })
  is_active: boolean;

  @OneToMany(() => User, (user) => user.department)
  users: User[];
}

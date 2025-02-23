import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({
    name: 'created_at',
    type: 'bigint',
    default: () => 'EXTRACT(epoch FROM NOW()) * 1000',
  })
  created_at: number;

  @Column({
    name: 'updated_at',
    type: 'bigint',
    default: Date.now(),
  })
  updated_at: number;
}

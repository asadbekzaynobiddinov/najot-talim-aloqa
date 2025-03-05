import { BaseEntity } from 'src/common/database';
import { Column, Entity } from 'typeorm';

@Entity('appeals')
export class Appeals extends BaseEntity {
  @Column()
  text: string;

  @Column({ nullable: true })
  file: string;
}

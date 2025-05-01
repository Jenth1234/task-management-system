import { Injectable } from '@nestjs/common';

@Injectable()
export class CatsService {
  private cats: string[] = [];

  create(catName: string): string {
    this.cats.push(catName);
    return `Cat ${catName} has been added.`;
  }

  findAll(): string[] {
    return this.cats;
  }

  findOne(index: number): string {
    return this.cats[index] || 'Cat not found';
  }
}

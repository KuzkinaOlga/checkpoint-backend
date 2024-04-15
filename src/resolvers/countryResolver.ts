import { Resolver, Query, Arg, Mutation } from 'type-graphql';
import { Country } from '../entity/country';

@Resolver(Country)
export class CountryResolver {
  @Mutation(() => Country)
  async addCountry(
    @Arg('code') code: string,
    @Arg('name') name: string,
    @Arg('emoji') emoji: string,
    @Arg('adder') adder: string
  ): Promise<Country> {
    const country = Country.create({
      code,
      name,
      emoji,
      adder,
    });
    await country.save();
    return country;
  }

  @Query(() => [Country])
  async countries(): Promise<Country[]> {
    return Country.find();
  }
  @Query(() => Country, { nullable: true })
  async country(@Arg('code') code: string): Promise<Country | undefined> {
    const result = await Country.findOne({ where: { code } });
    return result ?? undefined;
  }
}

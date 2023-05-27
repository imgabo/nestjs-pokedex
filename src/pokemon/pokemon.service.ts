import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) { }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);

      return pokemon;
    } catch (Error) {
      this.handleExeptions(Error)
    }

  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term })
    }
    // MongoID
    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }
    //Name
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase() })
    }

    if (!pokemon) {
      throw new NotFoundException(`Pokemon with id, name or no "${term}" not found`)
    }

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }

    const pokemon = await this.findOne(term)
    if (!pokemon) {
      throw new NotFoundException(`Pokemon with id, name or no "${term}" not found`)
    }
    try {
      await pokemon.updateOne(updatePokemonDto)
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExeptions(error)
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne( id )
    // await pokemon.deleteOne();
    const { deletedCount , acknowledged } = await this.pokemonModel.deleteOne({_id : id})

    if(deletedCount === 0) {
      throw new BadRequestException(`Pokemon with id "${id}" not found`)
    }

    return;
  }


  private handleExeptions(error : any ){
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon Exist in db ${JSON.stringify(error.keyValue)}`)
    }
    console.log(Error)
    throw new InternalServerErrorException(` Can't Create Pokemon  - Check Server Console `)
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './bspost.schema';
import { Model } from 'mongoose';
import { CreatePostDto } from './createpost.dto';
import { AzureBlobService } from 'src/imageBlob/imageBlob.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BspostService {
    private readonly containerName :string;
    
    constructor(
        @InjectModel(Post.name)
        private postModel: Model<Post>,
        private azureBlobService: AzureBlobService,
        private readonly configService: ConfigService
    ) { 
        this.containerName = this.configService.get<string>('AZURE_STORAGE_CONTAINER_NAME');
    }

    async createPost(bs_id: string, createPostDto: CreatePostDto, file?: Express.Multer.File): Promise<Post> {
        if (!bs_id) {
            throw new Error('Business ID is required'); // Throw a clear error if `bs_id` is missing
        }
        let imageUrl = '';
        if (file) {
            imageUrl = await this.azureBlobService.upload(file, this.containerName);
        }
        
        const newPost = new this.postModel({
            ...createPostDto,
            image: imageUrl,
            business_id: bs_id,
        });

        // Save and return the new post
        return await newPost.save();
    }


    async getAllPosts(bs_id: string): Promise<Post[]> {
        if (!bs_id) {
            throw new Error('Business ID is required');
        }
        try {
            return await this.postModel.find({ business_id: bs_id }).exec();
        } catch (error) {
            console.log(error);
            throw error;
        }
        
    }

    async getAllPostsByFlag(bs_id: string): Promise<Post[]> {
        if (!bs_id) {
            throw new Error('Business ID is required');
        }
        try {
            return await this.postModel.find({ business_id: bs_id, Pflag: Number(0) }).exec();
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    async getPostById(bs_id: string, id: string): Promise<Post> {
        if (!bs_id || !id) {
            throw new Error('Business ID and ID are required');
        }
        try {
            const post = await this.postModel.findById({ _id: id, business_id: bs_id }).exec();
            if (!post) {
                throw new Error('Post not found');
            }
            return post;
        } catch (error) {
            console.log(error);
            throw error;
        }
        
    }

    async getPostByFlag(bs_id: string, id: string): Promise<Post> {
        if (!bs_id || !id) {
            throw new Error('Business ID and ID are required');
        }
        try {
            const post = await this.postModel.findById({ _id: id, business_id: bs_id ,Pflag:0}).exec();
            if (!post) {
                throw new Error('Post not found');
            }
            return post;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async updatePostFlag(bs_id: string, id: string) {
        if (!bs_id || !id) {
            throw new Error('Business ID and ID are required');
        }
        try {
            const post = await this.postModel.findOneAndUpdate({ _id: id, business_id: bs_id }, { $inc: { Pflag: 1 } }, { new: true }).exec();
            if (!post) {
                throw new Error('Post not found');
            }
            
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    async uncommentPost(cust_id: string, id: string): Promise<Post> {
        if (!cust_id || !id ) {
            throw new Error('Business ID, ID and User are required');
        }
        try {
            const post = await this.postModel.findOneAndUpdate(
                { _id: id},
                {$pull: { comments: { cust_id } }},
                { new: true }).exec();
            if (!post) {
                throw new Error('Post not found');
            }
            return post;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    async deletePost(bs_id: string, id: string): Promise<void> {
        if (!bs_id || !id) {
            throw new Error('Business ID and ID are required');
        }
        try {
            const post = await this.postModel.findByIdAndDelete({ _id: id, business_id: bs_id }).exec();
            if (!post) {
                throw new Error('Post not found');
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
        
    }

    async updatePost(bs_id: string, id: string, updatePostDto: CreatePostDto): Promise<Post> {
        if (!bs_id || !id) {
            throw new Error('Business ID and ID are required');
        }
        try {
            const post = await this.postModel.findOneAndUpdate({ _id:id, business_id: bs_id }, updatePostDto, { new: true }).exec();
            if (!post) {
                throw new Error('Post not found');
            }
            return post;
        } catch (error) {
            console.log(error);
            throw error;
        }
        
    }

    async likePost(cust_id: string, id: string): Promise<Post> {
        if (!cust_id || !id) {
            throw new Error('Business ID and ID are required');
        }
        try {
            const post = await this.postModel.findOneAndUpdate(
                { _id: id },
                { $inc: { likes: 1 } },
            
                { new: true }).exec();
            if (!post) {
                throw new Error('Post not found');
            }
            post.likedBy.push(cust_id);
            return post;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async unlikePost(cust_id: string, id: string): Promise<Post> {
        if (!cust_id || !id) {
            throw new Error('Business ID and ID are required');
        }
        try {
            const post = await this.postModel.findOneAndUpdate(
                { _id: id},
                { $inc: { likes: -1 } },
                { new: true }).exec();
            if (!post) {
                throw new Error('Post not found');
            }
            post.likedBy = post.likedBy.filter(user => user !== cust_id);
            return post;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async commentPost(cust_id: string, id: string,updateComment:any): Promise<Post> {
        if (!cust_id || !id) {
            throw new Error('Business ID and ID are required');
        }
        try {
            const post = await this.postModel.findOneAndUpdate(
                { _id: id},
                { $push: { comments: { user: cust_id, comment: updateComment.comment } } },
                { new: true }).exec();
            if (!post) {
                throw new Error('Post not found');
            }
            return post;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

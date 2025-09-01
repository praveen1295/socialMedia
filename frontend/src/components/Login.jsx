import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';
import { config } from '../config/config';

const Login = () => {
    const [input, setInput] = useState({
        emailOrUsername: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const {user} = useSelector(store=>store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const signupHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post(config.API_ENDPOINTS.USER.LOGIN, input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setAuthUser(res.data.user));
                navigate("/");
                toast.success(res.data.message);
                setInput({
                    emailOrUsername: "",
                    password: ""
                });
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=>{
        if(user){
            navigate("/");
        }
    },[])
    return (
        <div className='flex items-center w-screen h-screen justify-center bg-gray-50'>
            <form onSubmit={signupHandler} className='shadow-lg flex flex-col gap-5 p-8 bg-white rounded-lg w-full max-w-md'>
                <div className='my-4 text-center'>
                    <h1 className='text-center font-bold text-2xl text-gray-800'>SocialMedia</h1>
                    <p className='text-sm text-center text-gray-600 mt-2'>Welcome back! Please sign in to your account</p>
                </div>
                <div>
                    <span className='font-medium text-gray-700'>Email or Username</span>
                    <Input
                        type="text"
                        name="emailOrUsername"
                        value={input.emailOrUsername}
                        onChange={changeEventHandler}
                        placeholder="Enter your email or username"
                        className="focus-visible:ring-transparent my-2"
                        required
                    />
                </div>
                <div>
                    <span className='font-medium text-gray-700'>Password</span>
                    <Input
                        type="password"
                        name="password"
                        value={input.password}
                        onChange={changeEventHandler}
                        placeholder="Enter your password"
                        className="focus-visible:ring-transparent my-2"
                        required
                    />
                </div>
                {
                    loading ? (
                        <Button disabled className='mt-4'>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Signing in...
                        </Button>
                    ) : (
                        <Button type='submit' className='mt-4'>Sign In</Button>
                    )
                }

                <span className='text-center text-sm text-gray-600'>
                    Don't have an account? <Link to="/signup" className='text-blue-600 hover:text-blue-700 font-medium'>Sign up</Link>
                </span>
            </form>
        </div>
    )
}

export default Login
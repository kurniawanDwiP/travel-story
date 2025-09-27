import React from 'react';
import PasswordInput from '../../components/PasswordInput';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosinstance';
import { motion } from 'motion/react';

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState(null);

	const navigate = useNavigate();
	const handleLogin = async (e) => {
		e.preventDefault();

		if (!validateEmail(email)) {
			setError('Please enter a valid email or password');
			return;
		}
		if (!password) {
			setError('please enter the password');
			return;
		}
		setError('');

		// API Call
		try {
			const response = await axiosInstance.post('/login', {
				email: email,
				password: password,
			});

			if (response.data && response.data.accessToken) {
				localStorage.setItem('token', response.data.accessToken);
				navigate('/dashboard');
			}
		} catch (error) {
			if (
				error.response &&
				error.response.data &&
				error.response.data.message
			) {
				setError(error.response.data.message);
			} else {
				setError('An unexpected error occurred.Please try again.');
			}
		}
	};

	return (
		<div className="h-screen bg-cyan-50 overflow-hidden relative">
			<div className="login-ui-box right-10 -top-40 z" />
			<div className="login-ui-box bg-cyan-200 -bottom-40 right-1/2" />
			<motion.div
				className="container h-screen flex items-center justify-center px-20 mx-auto"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 1.5 }}
			>
				<div className="w-2/4 h-[90vh] flex items-end bg-login-image bg-cover bg-center rounded-lg p-10 z-50">
					<div className="">
						<h4 className="text-5xl text-white font-semibold leading-[58px] ">
							Capture Your <br />
							Journey
						</h4>
						<p className="text-[15px] text-white leading-6 pr-7 mt-4">
							Record your travel experiences and memories in your personal
							travel journal.
						</p>
					</div>
				</div>
				<motion.div
					className="w-2/4 h-[75vh] p-16 bg-white rounded-r-lg shadow-cyan-200/20 z-40"
					initial={{ x: -600 }}
					animate={{ x: 0 }}
					transition={{ duration: 0.8, delay: 1.5 }}
				>
					<form action="" onSubmit={handleLogin}>
						<h4 className="text-2xl font-semibold mb-7">Login</h4>
						<input
							type="text"
							placeholder="email"
							className="input-box"
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
							}}
						/>

						<PasswordInput
							value={password}
							onChange={(e) => {
								setPassword(e.target.value), console.log(e);
							}}
						/>
						{error && <p className="text-red-500 text-xs">{error}</p>}
						<button type="submit" className="btn-primary">
							LOGIN
						</button>
						<p className="text-xs text-slate-500 my-4">OR</p>
						<button
							type="submit"
							className="btn-primary btn-light"
							onClick={() => {
								navigate('/signUp');
							}}
						>
							CREATE ACCOUNT
						</button>
					</form>
				</motion.div>
			</motion.div>
		</div>
	);
};

export default Login;

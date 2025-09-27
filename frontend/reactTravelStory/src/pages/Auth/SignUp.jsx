import React from 'react';
import PasswordInput from '../../components/PasswordInput';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosinstance';
import { motion } from 'motion/react';

const SignUp = () => {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState(null);

	const navigate = useNavigate();
	const handleSignUp = async (e) => {
		e.preventDefault();

		if (!name) {
			setError('Please enter your name');
			return;
		}

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
			const response = await axiosInstance.post('/create-account', {
				fullname: name,
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
				<div className="w-2/4 h-[90vh] flex items-end bg-signup-image bg-cover bg-center rounded-lg p-10 z-50">
					<div className="">
						<h4 className="text-5xl text-white font-semibold leading-[58px] ">
							Join the <br />
							Adventure
						</h4>
						<p className="text-[15px] text-white leading-6 pr-7 mt-4">
							Create account to start documenting your travel and preserving
							your memories in your personal travel journal
						</p>
					</div>
				</div>
				<motion.div
					className="w-2/4 h-[75vh] p-16 bg-white rounded-r-lg shadow-cyan-200/20 z-40"
					initial={{ x: -600 }}
					animate={{ x: 0 }}
					transition={{ duration: 0.8, delay: 1.5 }}
				>
					<form action="" onSubmit={handleSignUp}>
						<h4 className="text-2xl font-semibold mb-7">SignUp</h4>
						<input
							type="text"
							placeholder="Full Name"
							className="input-box"
							value={name}
							onChange={(e) => {
								setName(e.target.value);
							}}
						/>

						<input
							type="text"
							placeholder="Email"
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
							CREATE ACCOUNT
						</button>
						<p className="text-xs text-slate-500 my-4">OR</p>
						<button
							type="submit"
							className="btn-primary btn-light"
							onClick={() => {
								navigate('/login');
							}}
						>
							LOGIN
						</button>
					</form>
				</motion.div>
			</motion.div>
		</div>
	);
};

export default SignUp;

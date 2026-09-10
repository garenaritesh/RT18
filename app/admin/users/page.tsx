"use client";

import { useEffect, useState } from "react";

type User = {
	id: number;
	name: string;
	email: string;
	phone: string | null;
	created_at: string;
};

export default function UsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		async function loadUsers() {
			try {
				const response = await fetch("/api/admin/users");
				const data = await response.json();

				if (!response.ok || !data.success) {
					setError(data.message || "Failed to load users");
					return;
				}

				setUsers(data.users);
			} catch (loadError) {
				console.error("Load users error:", loadError);
				setError("Something went wrong while loading users");
			} finally {
				setLoading(false);
			}
		}

		loadUsers();
	}, []);

	return (
		<main className="mx-auto max-w-6xl">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">Users</h1>
				<p className="mt-1 text-gray-500">
					View customers registered on the website.
				</p>
			</div>

			<div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
					<p className="text-sm font-medium text-gray-500">Total users</p>
					<p className="mt-2 text-3xl font-bold text-gray-900">
						{loading ? "-" : users.length}
					</p>
				</div>
			</div>

			<section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
				<div className="border-b border-gray-200 px-5 py-4">
					<h2 className="text-lg font-bold text-gray-900">
						Registered users
					</h2>
				</div>

				{loading && (
					<p className="px-5 py-8 text-center text-gray-500">
						Loading users...
					</p>
				)}

				{!loading && error && (
					<p className="px-5 py-8 text-center text-red-600">{error}</p>
				)}

				{!loading && !error && users.length === 0 && (
					<p className="px-5 py-8 text-center text-gray-500">
						No registered users yet.
					</p>
				)}

				{!loading && !error && users.length > 0 && (
					<div className="overflow-x-auto">
						<table className="min-w-full text-left text-sm">
							<thead className="bg-gray-50 text-xs uppercase text-gray-500">
								<tr>
									<th className="px-5 py-3 font-semibold">Name</th>
									<th className="px-5 py-3 font-semibold">Email</th>
									<th className="px-5 py-3 font-semibold">Phone number</th>
									<th className="px-5 py-3 font-semibold">Registered</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{users.map((user) => (
									<tr key={user.id} className="text-gray-700">
										<td className="whitespace-nowrap px-5 py-4 font-medium text-gray-900">
											{user.name}
										</td>
										<td className="whitespace-nowrap px-5 py-4">
											{user.email}
										</td>
										<td className="whitespace-nowrap px-5 py-4">
											{user.phone || "Not provided"}
										</td>
										<td className="whitespace-nowrap px-5 py-4">
											{new Date(user.created_at).toLocaleDateString()}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>
		</main>
	);
}

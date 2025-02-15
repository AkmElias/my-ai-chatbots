export async function fetchGitHubProjects() {
  const response = await fetch("https://api.github.com/users/AkmElias/repos?sort=stars&direction=desc")
  if (!response.ok) {
    throw new Error("Failed to fetch GitHub projects")
  }
  const repos = await response.json()
  return repos.slice(0, 5).map((repo: any) => ({
    name: repo.name,
    url: repo.html_url,
    description: repo.description,
    stars: repo.stargazers_count,
  }))
}


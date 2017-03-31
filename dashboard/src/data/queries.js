export default [
    {
        desc: "Relations between top directors and actors",
        text: `{
    A as var(func: anyofterms(name@en, "hanks pitt damon dicaprio")) {
        actor.film {
            F as performance.film
        }
    }

    directors(func: anyofterms(name@en, "spielberg nolan tarantino")) @cascade {
        name@en
        director.film @filter(var(F)) {
            name@en
            starring {
                performance.actor @filter(var(A)) {
                    name@en
                }
                performance.character {
                    name@en
                }
            }
        }
    }
}`,
        lastRun: Date.now()
    },
    {
        desc: "Top 5 Steven Spielberg movies?",
        text: `{
    var(func:allofterms(name, "steven spielberg")) {
        name@en
        films as director.film {
            p as count(starring)
            q as count(genre)
            r as count(country)
            score as sumvar(p, q, r)
        }
    }
    TopMovies(id: var(films), orderdesc: var(score), first: 5){
        name@en
        var(score)
    }
}`,
        lastRun: Date.now()
    },
    {
        desc: "Who played Harry Potter?",
        text: `{
  HP(func: allofterms(name, "Harry Potter")) @cascade {
    name@en
    starring{
        performance.character @filter(allofterms(name, "harry")) {
          name@en
        }
        performance.actor {
            name@en
        }
    }
  }
}`,
        lastRun: Date.now()
    },
    {
        desc: "How are Spielberg and Matt Deamon related?",
        text: `{
  A as shortest(from: 0x3b0de646eaf32b75, to: 0x36692145960cfceb) {
    director.film
    starring
    performance.actor
  }

  names(id: var(A)) {
    name@en
  }
}`,
        lastRun: Date.now()
    },
    {
        desc: "Random actor details of a top genre",
        text: `{
    recurse(func: gt(count(~genre), 50000)){
        name@en
        ~genre (first:10) @filter(gt(count(starring), 100))
        starring (first: 3)
        performance.actor
    }
}`,
        lastRun: Date.now()
    },
    {
        desc: "Brad Pitt in LA?",
        text: `{
  PittInLA(func: allofterms(name, "los angeles")) @cascade  {
    name@en
      location.featured_in_films {
      name@en
      starring {
        performance.actor @filter(allofterms(name, "brad pitt")) {
          name@en
        }
      }
    }
  }
}`,
        lastRun: Date.now()
    }
];

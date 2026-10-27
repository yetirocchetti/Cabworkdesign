<?php
/**
 * Any page that isn't the storefront (a plugin's test page, a post): the same
 * header and footer around its content.
 */
get_header(); ?>

  <main id="top">
    <section>
      <div class="wrap">
        <?php while ( have_posts() ) : the_post(); ?>
          <article <?php post_class(); ?>>
            <h1><?php the_title(); ?></h1>
            <?php the_content(); ?>
          </article>
        <?php endwhile; ?>
      </div>
    </section>
  </main>

<?php get_footer(); ?>
